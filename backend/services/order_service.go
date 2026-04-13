package services

import (
	"context"
	"errors"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgconn"
	"gorm.io/gorm"

	"mastutik-api/dto"
	"mastutik-api/models"
	"mastutik-api/repositories"
)

var (
	ErrOrderNotFound         = errors.New("order not found")
	ErrOrderNotPaid          = errors.New("order must be paid before check-in")
	ErrOrderAlreadyCheckedIn = errors.New("order has already been checked in")
	ErrWebhookAlreadyHandled = errors.New("webhook already processed")
	ErrOrderValidation       = errors.New("invalid order request")
	ErrOrderHasNoTicketItems = errors.New("order does not contain ticket items")
)

const orderDBTimeout = 5 * time.Second

type OrderService interface {
	CreateOrder(ctx context.Context, userID uint, req dto.CreateOrderRequest) (*models.Order, error)
	GetMyOrders(ctx context.Context, userID uint, query dto.OrderListQuery) ([]models.Order, error)
	GetOrderByID(ctx context.Context, orderID string, userID uint) (*models.Order, error)

	GetAllOrdersAdmin(ctx context.Context, query dto.OrderListQuery) ([]models.Order, error)
	GetOrderByIDAdmin(ctx context.Context, orderID string) (*models.Order, error)
	CheckInOrder(ctx context.Context, orderID string, adminUserID uint) (*models.Order, error)
	ResumeOrder(ctx context.Context, orderID string, userID uint) (*models.Order, error)
	ProcessXenditWebhook(ctx context.Context, payload dto.XenditWebhookRequest, rawPayload string) error
}

type orderService struct {
	repo      repositories.OrderRepository
	eventRepo repositories.EventRepository
	merchRepo repositories.MerchandiseRepository
	userRepo  repositories.UserRepository
	xenditSvc XenditService
}

func NewOrderService(repo repositories.OrderRepository, eventRepo repositories.EventRepository, merchRepo repositories.MerchandiseRepository, userRepo repositories.UserRepository, xenditSvc XenditService) OrderService {
	return &orderService{
		repo:      repo,
		eventRepo: eventRepo,
		merchRepo: merchRepo,
		userRepo:  userRepo,
		xenditSvc: xenditSvc,
	}
}

func withOrderTimeout(ctx context.Context) (context.Context, context.CancelFunc) {
	if ctx == nil {
		ctx = context.Background()
	}

	return context.WithTimeout(ctx, orderDBTimeout)
}

func normalizeOrderListQuery(query dto.OrderListQuery) dto.OrderListQuery {
	if query.Limit <= 0 {
		query.Limit = 10
	}
	if query.Limit > 100 {
		query.Limit = 100
	}
	if query.Offset < 0 {
		query.Offset = 0
	}

	return query
}

func aggregateTicketItems(items []dto.OrderItemRequest) []dto.OrderItemRequest {
	aggregated := make(map[uint]int)
	for _, item := range items {
		if item.Quantity > 0 {
			aggregated[item.TicketTypeID] += item.Quantity
		}
	}

	var result []dto.OrderItemRequest
	for id, qty := range aggregated {
		result = append(result, dto.OrderItemRequest{
			TicketTypeID: id,
			Quantity:     qty,
		})
	}
	return result
}

func aggregateMerchandiseItems(items []dto.OrderMerchandiseItemRequest) []dto.OrderMerchandiseItemRequest {
	aggregated := make(map[uint]int)
	for _, item := range items {
		if item.Quantity > 0 {
			aggregated[item.MerchandiseID] += item.Quantity
		}
	}

	var result []dto.OrderMerchandiseItemRequest
	for id, qty := range aggregated {
		result = append(result, dto.OrderMerchandiseItemRequest{
			MerchandiseID: id,
			Quantity:      qty,
		})
	}
	return result
}

func isUniqueViolation(err error) bool {
	var pgErr *pgconn.PgError
	return errors.As(err, &pgErr) && pgErr.Code == "23505"
}

func appendItemDescription(current string, quantity int, name string) string {
	if current == "" {
		return fmt.Sprintf("%dx %s", quantity, name)
	}

	return current + ", " + fmt.Sprintf("%dx %s", quantity, name)
}

func (s *orderService) CreateOrder(ctx context.Context, userID uint, req dto.CreateOrderRequest) (*models.Order, error) {
	ctx, cancel := withOrderTimeout(ctx)
	defer cancel()

	// 0. Idempotency Check
	log.Printf("CREATE ORDER START - UserID: %d, Key: %s", userID, req.IdempotencyKey)
	log.Printf("Payload: %+v", req)

	if req.IdempotencyKey != "" {
		existingOrder, err := s.repo.FindOrderByIdempotencyKey(ctx, req.IdempotencyKey)
		if err == nil && existingOrder != nil {
			return existingOrder, nil
		}
	}

	// 1. Initiate Database Transaction
	tx := s.repo.BeginTx(ctx)
	// Definisikan defer agar otomatis Rollback jika terjadi panic atau abort Return yang belum ke Commit
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var totalAmount float64
	var orderItems []models.OrderItem
	var itemDescriptions string

	// 1.5 Aggregate and Validate Items
	ticketItemsReq := append([]dto.OrderItemRequest{}, req.Items...)
	ticketItemsReq = append(ticketItemsReq, req.TicketItems...)
	ticketItems := aggregateTicketItems(ticketItemsReq)
	merchandiseItems := aggregateMerchandiseItems(req.MerchandiseItems)

	if len(ticketItems) == 0 && len(merchandiseItems) == 0 {
		return nil, fmt.Errorf("%w: order must contain at least one valid ticket or merchandise item with quantity > 0", ErrOrderValidation)
	}

	// 2. Loop Ticket Types yang ingin dibeli, validasi harga murni milik Backend (Bukan dari Frontend)
	for _, item := range ticketItems {
		if item.Quantity <= 0 {
			continue // Should have been filtered by aggregator, but safety first
		}
		if item.Quantity > 10 { // Limit as suggested by user
			return nil, fmt.Errorf("%w: quantity too large for ticket type %d (max 10)", ErrOrderValidation, item.TicketTypeID)
		}

		ticket, err := s.repo.FindTicketTypeWithLock(tx, item.TicketTypeID)
		if err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("%w: ticket type id %d not found", ErrOrderValidation, item.TicketTypeID)
		}

		if !ticket.ActiveStatus {
			tx.Rollback()
			return nil, fmt.Errorf("%w: ticket %s is no longer active", ErrOrderValidation, ticket.Name)
		}

		if ticket.RemainingQuota < item.Quantity {
			tx.Rollback()
			return nil, fmt.Errorf("%w: not enough quota for ticket %s", ErrOrderValidation, ticket.Name)
		}

		// Atomic Quota Reduction to prevent overselling
		if err := s.repo.DecrementTicketQuota(tx, ticket.ID, item.Quantity); err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("%w: tiket %s sudah habis atau tidak tersedia", ErrOrderValidation, ticket.Name)
		}

		// Hitung Total (Harga * Qty)
		totalAmount += ticket.Price * float64(item.Quantity)

		// Catat ke slice items
		ticketID := ticket.ID
		orderItems = append(orderItems, models.OrderItem{
			ItemType:     "ticket",
			ItemName:     ticket.Name,
			TicketTypeID: &ticketID,
			Quantity:     item.Quantity,
			PricePerItem: ticket.Price,
		})

		itemDescriptions = appendItemDescription(itemDescriptions, item.Quantity, ticket.Name)
	}

	for _, item := range merchandiseItems {
		if item.Quantity <= 0 {
			continue
		}
		if item.Quantity > 20 { // Merch can be slightly more than tickets
			return nil, fmt.Errorf("%w: quantity too large for merchandise %d (max 20)", ErrOrderValidation, item.MerchandiseID)
		}

		merchandise, err := s.merchRepo.FindByIDWithLock(tx, item.MerchandiseID)
		if err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("%w: merchandise id %d not found", ErrOrderValidation, item.MerchandiseID)
		}

		if !merchandise.ActiveStatus {
			tx.Rollback()
			return nil, fmt.Errorf("%w: merchandise %s is inactive", ErrOrderValidation, merchandise.Name)
		}

		if merchandise.Stock < item.Quantity {
			tx.Rollback()
			return nil, fmt.Errorf("%w: not enough stock for merchandise %s", ErrOrderValidation, merchandise.Name)
		}

		// Atomic Stock Reduction to prevent overselling
		if err := s.merchRepo.DecrementStock(tx, merchandise.ID, item.Quantity); err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("%w: stok merchandise %s sudah habis", ErrOrderValidation, merchandise.Name)
		}

		totalAmount += merchandise.Price * float64(item.Quantity)

		merchandiseID := merchandise.ID
		orderItems = append(orderItems, models.OrderItem{
			ItemType:      "merchandise",
			ItemName:      merchandise.Name,
			MerchandiseID: &merchandiseID,
			Quantity:      item.Quantity,
			PricePerItem:  merchandise.Price,
		})

		itemDescriptions = appendItemDescription(itemDescriptions, item.Quantity, merchandise.Name)
	}

	// 2.5 Total Amount Validation
	if totalAmount <= 0 {
		tx.Rollback()
		return nil, fmt.Errorf("%w: total amount must be greater than 0", ErrOrderValidation)
	}

	// 3. Setup Order struct
	newOrderID := uuid.New()
	var idKeyPtr *string
	if req.IdempotencyKey != "" {
		idKeyPtr = &req.IdempotencyKey
	}

	order := &models.Order{
		ID:             newOrderID,
		UserID:         userID,
		TotalAmount:    totalAmount,
		Status:         "PENDING",
		ExpiredAt:      time.Now().Add(24 * time.Hour),
		IdempotencyKey: idKeyPtr,
		OrderItems:     orderItems,
	}

	// 4. Eksekusi Full Save Order FIRST
	if err := s.repo.CreateOrderWithTx(tx, order); err != nil {
		tx.Rollback()
		return nil, errors.New("failed to save order data")
	}

	// COMMIT Transaksi terlebih dahulu agar tidak nge-lock database saat manggil API Xendit (network latency)
	if err := tx.Commit().Error; err != nil {
		return nil, errors.New("failed to finalize transaction")
	}

	// 5. Minta Invoice Xendit
	// Get detail user for invoice
	user, err := s.userRepo.FindByID(userID)
	if err == nil {
		invoiceID, checkoutURL, err := s.xenditSvc.CreateInvoice(newOrderID, user.Email, totalAmount, itemDescriptions, req.PaymentMethod)
		if err != nil {
			log.Printf("Xendit Error for Order %s: %v", newOrderID, err)
			
			// Xendit timeout / error. JANGAN RETURN 500 karena order sukses terbuat!
			// Cukup return order dengan instruksi error halus
			// Frontend akan mengecek checkout_url
			order.Payment = &models.Payment{
				OrderID:         newOrderID,
				Status:          "FAILED_TO_GENERATE",
			}
		} else {
			// Masukkan payment details ke order di database
			payment := &models.Payment{
				OrderID:         newOrderID,
				XenditInvoiceID: invoiceID,
				CheckoutURL:     checkoutURL,
				Status:          "PENDING",
			}
			// Update payment via background context since tx is already committed
			s.repo.UpdatePaymentStatus(context.Background(), payment)
			order.Payment = payment
		}
	}

	createdOrder, err := s.repo.FindOrderByID(ctx, order.ID.String())
	if err != nil {
		return nil, err
	}

	// 🧠 DEBUG WAJIB TAMBAH
	log.Println("ORDER CREATED:", createdOrder.ID)
	// Some cases order.Payment is empty or FAILED_TO_GENERATE so we check first
	if createdOrder.Payment != nil {
		log.Println("INVOICE ID:", createdOrder.Payment.XenditInvoiceID)
	} else {
		log.Println("INVOICE ID:", "NONE")
	}
	log.Println("STATUS:", createdOrder.Status)
	log.Println("QR:", createdOrder.QRCode)

	return createdOrder, nil
}

func (s *orderService) GetMyOrders(ctx context.Context, userID uint, query dto.OrderListQuery) ([]models.Order, error) {
	ctx, cancel := withOrderTimeout(ctx)
	defer cancel()

	log.Println("USER ID:", userID)
	log.Println("ORDER FILTER:", query.Filter)

	query = normalizeOrderListQuery(query)
	
	filter := query.Filter
	if filter == "" && query.Status != "" {
		filter = query.Status
	}

	// PROACTIVE SYNC: Automatically check any PENDING orders against Xendit
	// To prevent tickets getting stuck in History if user bypassed Success Page
	var pendingOrders []models.Order
	// Limit proactively to 3 latest pending items for instant performance
	pendingOrders, _ = s.repo.FindOrdersByUserID(ctx, userID, 3, 0, "pending")
	for _, po := range pendingOrders {
		if po.Payment != nil && po.Payment.XenditInvoiceID != "" {
			status, err := s.xenditSvc.GetInvoiceStatus(po.Payment.XenditInvoiceID)
			if err == nil && (status == "PAID" || status == "SETTLED") {
				payload := dto.XenditWebhookRequest{
					ID:         po.Payment.XenditInvoiceID,
					ExternalID: po.ID.String(),
					Status:     status,
				}
				s.ProcessXenditWebhook(context.Background(), payload, `{"sync":"auto_getmyorders"}`)
			}
		}
	}

	orders, err := s.repo.FindOrdersByUserID(ctx, userID, query.Limit, query.Offset, filter)
	if err == nil {
		log.Println("USER ORDERS FETCHED:", len(orders))
		if filter == "active" {
			for _, o := range orders {
				log.Println("ORDER STATUS:", o.Status)
			}
			log.Println("USER ID:", userID)
			log.Println("MY ITEM RESULT:", len(orders), "items found")
		}
	} else {
		log.Println("ERROR FETCHING ORDERS:", err)
	}

	return orders, err
}

func (s *orderService) GetOrderByID(ctx context.Context, orderID string, userID uint) (*models.Order, error) {
	ctx, cancel := withOrderTimeout(ctx)
	defer cancel()

	order, err := s.repo.FindOrderByID(ctx, orderID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrOrderNotFound
		}

		return nil, err
	}

	if order.UserID != userID {
		return nil, errors.New("unauthorized: you do not own this order")
	}

	// Auto-Sync if PENDING, ensures user instantly gets the item even if webhook is delayed
	if order.Status == "PENDING" && order.Payment != nil && order.Payment.XenditInvoiceID != "" {
		status, err := s.xenditSvc.GetInvoiceStatus(order.Payment.XenditInvoiceID)
		if err == nil && (status == "PAID" || status == "SETTLED") {
			payload := dto.XenditWebhookRequest{
				ID:         order.Payment.XenditInvoiceID,
				ExternalID: order.ID.String(),
				Status:     status,
			}
			// Simulate webhook processing synchronously
			s.ProcessXenditWebhook(context.Background(), payload, `{"sync":"manual"}`)
			// Refetch order to get updated status
			if updatedOrder, err := s.repo.FindOrderByID(ctx, orderID); err == nil {
				order = updatedOrder
			}
		}
	}

	return order, nil
}

func (s *orderService) GetAllOrdersAdmin(ctx context.Context, query dto.OrderListQuery) ([]models.Order, error) {
	ctx, cancel := withOrderTimeout(ctx)
	defer cancel()

	query = normalizeOrderListQuery(query)
	return s.repo.FindAllOrdersAdmin(ctx, query.Limit, query.Offset, query.Status, query.PaymentStatus)
}

func (s *orderService) GetOrderByIDAdmin(ctx context.Context, orderID string) (*models.Order, error) {
	ctx, cancel := withOrderTimeout(ctx)
	defer cancel()

	order, err := s.repo.FindOrderByIDAdmin(ctx, orderID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrOrderNotFound
		}

		return nil, err
	}
	return order, nil
}

func (s *orderService) ResumeOrder(ctx context.Context, orderID string, userID uint) (*models.Order, error) {
	ctx, cancel := withOrderTimeout(ctx)
	defer cancel()

	// 1. Fetch Order with items
	order, err := s.repo.FindOrderByID(ctx, orderID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrOrderNotFound
		}
		return nil, err
	}

	// 2. Security Check: Ownership
	if order.UserID != userID {
		return nil, errors.New("unauthorized: you do not own this order")
	}

	// 3. Status Validation
	statusUpper := strings.ToUpper(order.Status)
	
	// Check if already paid
	if statusUpper == "PAID" || statusUpper == "SETTLED" {
		return nil, fmt.Errorf("%w: order is already paid", ErrOrderValidation)
	}

	// Check if already expired or cancelled
	if statusUpper == "EXPIRED" || statusUpper == "CANCELLED" || statusUpper == "FAILED" {
		return nil, fmt.Errorf("%w: order is already expired or cancelled", ErrOrderValidation)
	}

	// 4. Time-based Auto-Expiry Check (misal 24 jam dari created_at jika belum expired secara eksplisit)
	// Kita gunakan field order.ExpiredAt yang sudah ada di model
	if time.Now().After(order.ExpiredAt) {
		// Update status to EXPIRED in database
		order.Status = "expired"
		if order.Payment != nil {
			order.Payment.Status = "expired"
			s.repo.UpdatePaymentStatus(ctx, order.Payment)
		}
		s.repo.UpdateOrderStatus(ctx, order)
		return nil, fmt.Errorf("%w: order period has expired", ErrOrderValidation)
	}

	// 5. Handle Invoice Regeneration
	// Jika payment belum ada, atau URL kosong, atau atau statusnya FAILED_TO_GENERATE
	needsNewInvoice := order.Payment == nil || 
                     order.Payment.CheckoutURL == "" || 
                     order.Payment.Status == "FAILED_TO_GENERATE" ||
                     order.Payment.Status == "EXPIRED"

	if needsNewInvoice {
		user, err := s.userRepo.FindByID(userID)
		if err != nil {
			return nil, err
		}

		var descriptions string
		for _, item := range order.OrderItems {
			descriptions = appendItemDescription(descriptions, item.Quantity, item.ItemName)
		}

		// Generate new Xendit Invoice (Idempotency dihandle dengan ID order yang sama)
		invoiceID, checkoutURL, err := s.xenditSvc.CreateInvoice(order.ID, user.Email, order.TotalAmount, descriptions, "")
		if err != nil {
			log.Printf("Failed to regenerate Xendit Invoice for order %s: %v", order.ID, err)
			// Tetap kembalikan order tapi dengan status payment error agar frontend tahu
			return order, nil 
		}

		// Save/Update Payment Entry
		payment := &models.Payment{
			OrderID:         order.ID,
			XenditInvoiceID: invoiceID,
			CheckoutURL:     checkoutURL,
			Status:          "PENDING",
		}
		
		if err := s.repo.UpdatePaymentStatus(context.Background(), payment); err != nil {
			log.Printf("Failed to update payment status in DB for order %s: %v", order.ID, err)
		}
		
		order.Payment = payment
	}

	return order, nil
}

func (s *orderService) CheckInOrder(ctx context.Context, orderID string, adminUserID uint) (*models.Order, error) {
	ctx, cancel := withOrderTimeout(ctx)
	defer cancel()

	tx := s.repo.BeginTx(ctx)
	if tx.Error != nil {
		return nil, tx.Error
	}

	defer func() {
		if recovered := recover(); recovered != nil {
			tx.Rollback()
			panic(recovered)
		}
	}()

	order, err := s.repo.FindOrderByIDWithTx(tx, orderID)
	if err != nil {
		tx.Rollback()
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrOrderNotFound
		}

		return nil, err
	}

	if order.Status != "PAID" && order.Status != "paid" || order.Payment == nil || (order.Payment.Status != "PAID" && order.Payment.Status != "paid") {
		tx.Rollback()
		return nil, ErrOrderNotPaid
	}

	hasTicketItems := false
	for _, item := range order.OrderItems {
		if item.ItemType == "ticket" {
			hasTicketItems = true
			break
		}
	}
	if !hasTicketItems {
		tx.Rollback()
		return nil, ErrOrderHasNoTicketItems
	}

	if order.CheckedInAt != nil {
		tx.Rollback()
		return nil, ErrOrderAlreadyCheckedIn
	}

	now := time.Now()
	order.CheckedInAt = &now
	order.CheckedInBy = &adminUserID

	if err := s.repo.UpdateOrderStatusWithTx(tx, order); err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	updatedOrder, err := s.repo.FindOrderByIDAdmin(ctx, orderID)
	if err != nil {
		return nil, err
	}

	return updatedOrder, nil
}

func (s *orderService) restoreInventoryWithTx(tx *gorm.DB, order *models.Order) error {
	for _, item := range order.OrderItems {
		switch item.ItemType {
		case "ticket":
			if item.TicketTypeID == nil {
				continue
			}

			ticket, err := s.repo.FindTicketTypeWithLock(tx, *item.TicketTypeID)
			if err != nil {
				return err
			}

			if err := s.repo.UpdateTicketQuota(tx, ticket.ID, ticket.RemainingQuota+item.Quantity); err != nil {
				return err
			}
		case "merchandise":
			if item.MerchandiseID == nil {
				continue
			}

			merchandise, err := s.merchRepo.FindByIDWithLock(tx, *item.MerchandiseID)
			if err != nil {
				return err
			}

			if err := s.merchRepo.UpdateStockWithTx(tx, merchandise.ID, merchandise.Stock+item.Quantity); err != nil {
				return err
			}
		}
	}

	return nil
}

func (s *orderService) ProcessXenditWebhook(ctx context.Context, payload dto.XenditWebhookRequest, rawPayload string) error {
	ctx, cancel := withOrderTimeout(ctx)
	defer cancel()

	if _, err := s.repo.FindWebhookLogByInvoiceID(ctx, payload.ID); err == nil {
		return ErrWebhookAlreadyHandled
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}

	tx := s.repo.BeginTx(ctx)
	if tx.Error != nil {
		return tx.Error
	}

	defer func() {
		if recovered := recover(); recovered != nil {
			tx.Rollback()
			panic(recovered)
		}
	}()

	webhookLog := &models.PaymentWebhookLog{
		XenditInvoiceID: payload.ID,
		Payload:         rawPayload,
		Status:          "processing",
	}

	if err := s.repo.CreateWebhookLogWithTx(tx, webhookLog); err != nil {
		tx.Rollback()
		if isUniqueViolation(err) {
			return ErrWebhookAlreadyHandled
		}
		return err
	}

	order, err := s.repo.FindOrderByIDWithTx(tx, payload.ExternalID)
	if err != nil {
		tx.Rollback()
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrOrderNotFound
		}
		return err
	}

	if order.Payment == nil {
		tx.Rollback()
		return errors.New("payment entry not found")
	}

	if order.Payment.XenditInvoiceID != payload.ID {
		tx.Rollback()
		return errors.New("invoice ID does not match order payment")
	}

	switch payload.Status {
	case "PAID", "SETTLED":
		order.Status = "PAID"
		order.Payment.Status = "PAID"
		webhookLog.Status = "processed_paid"
		
		now := time.Now()
		order.PaidAt = &now
		order.QRCode = "QR-" + order.ID.String()

		// Set ExpiredAt to event end date if possible, or far future
		// This ensures paid tickets don't 'expire' just because the payment window (24h) passed
		newExpiry := time.Now().AddDate(1, 0, 0) // Default 1 year if no event found
		for _, item := range order.OrderItems {
			if item.TicketType != nil && item.TicketType.EventID != 0 {
				// We need event date. For now, let's use a safe far future or 
				// if we have event date, we use it.
				// Since we might not have it preloaded deeply here, let's use 1 year future
				// as a safeguard so the ticket stays in "Active".
			}
		}
		order.ExpiredAt = newExpiry
		log.Printf("[WEBHOOK] ORDER STATUS: %s", order.Status)
		log.Printf("[WEBHOOK] Order %s marked as PAID. New Expiry: %v", order.ID, order.ExpiredAt)
	case "EXPIRED":
		if order.Status == "pending" || order.Status == "PENDING" {
			if err := s.restoreInventoryWithTx(tx, order); err != nil {
				tx.Rollback()
				return err
			}
		}
		order.Status = "expired"
		order.Payment.Status = "expired"
		webhookLog.Status = "processed_expired"
	case "FAILED":
		if order.Status == "pending" || order.Status == "PENDING" {
			if err := s.restoreInventoryWithTx(tx, order); err != nil {
				tx.Rollback()
				return err
			}
		}
		order.Status = "failed"
		order.Payment.Status = "failed"
		webhookLog.Status = "processed_failed"
	default:
		webhookLog.Status = "ignored_" + payload.Status
	}

	if err := s.repo.UpdateOrderStatusWithTx(tx, order); err != nil {
		tx.Rollback()
		return err
	}

	if err := s.repo.UpdatePaymentStatusWithTx(tx, order.Payment); err != nil {
		tx.Rollback()
		return err
	}

	if err := s.repo.UpdateWebhookLogWithTx(tx, webhookLog); err != nil {
		tx.Rollback()
		return err
	}

	if err := tx.Commit().Error; err != nil {
		return err
	}

	return nil
}
