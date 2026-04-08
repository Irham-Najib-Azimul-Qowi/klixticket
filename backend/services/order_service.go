package services

import (
	"context"
	"errors"
	"fmt"
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
	ticketItems := append([]dto.OrderItemRequest{}, req.Items...)
	ticketItems = append(ticketItems, req.TicketItems...)
	merchandiseItems := req.MerchandiseItems

	if len(ticketItems) == 0 && len(merchandiseItems) == 0 {
		return nil, fmt.Errorf("%w: order must contain at least one ticket or merchandise item", ErrOrderValidation)
	}

	// 2. Loop Ticket Types yang ingin dibeli, validasi harga murni milik Backend (Bukan dari Frontend)
	for _, item := range ticketItems {
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

		// Kurangi quota di DB temporary space
		newRemainingQuota := ticket.RemainingQuota - item.Quantity
		if err := s.repo.UpdateTicketQuota(tx, ticket.ID, newRemainingQuota); err != nil {
			tx.Rollback()
			return nil, errors.New("failed to lock ticket quota")
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

		newStock := merchandise.Stock - item.Quantity
		if err := s.merchRepo.UpdateStockWithTx(tx, merchandise.ID, newStock); err != nil {
			tx.Rollback()
			return nil, errors.New("failed to lock merchandise stock")
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

	// 3. Setup Order struct
	newOrderID := uuid.New()
	order := &models.Order{
		ID:          newOrderID,
		UserID:      userID,
		TotalAmount: totalAmount,
		Status:      "pending",
		ExpiredAt:   time.Now().Add(24 * time.Hour),
		OrderItems:  orderItems,
	}

	// 4. Minta Invoice Xendit
	// Get detail user for invoice
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		tx.Rollback()
		return nil, errors.New("invalid user context")
	}

	invoiceID, checkoutURL, err := s.xenditSvc.CreateInvoice(newOrderID, user.Email, totalAmount, itemDescriptions, req.PaymentMethod)
	if err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("failed to communicate with payment gateway: %v", err)
	}

	// Masukkan payment details ke order
	order.Payment = &models.Payment{
		OrderID:         newOrderID,
		XenditInvoiceID: invoiceID,
		CheckoutURL:     checkoutURL,
		Status:          "pending",
	}

	// 5. Eksekusi Full Save
	if err := s.repo.CreateOrderWithTx(tx, order); err != nil {
		tx.Rollback()
		return nil, errors.New("failed to save order data")
	}

	// COMMIT Transaksi dan cek hasilnya
	if err := tx.Commit().Error; err != nil {
		return nil, errors.New("failed to finalize transaction")
	}

	createdOrder, err := s.repo.FindOrderByID(ctx, order.ID.String())
	if err != nil {
		return nil, err
	}

	return createdOrder, nil
}

func (s *orderService) GetMyOrders(ctx context.Context, userID uint, query dto.OrderListQuery) ([]models.Order, error) {
	ctx, cancel := withOrderTimeout(ctx)
	defer cancel()

	query = normalizeOrderListQuery(query)
	return s.repo.FindOrdersByUserID(ctx, userID, query.Limit, query.Offset, query.Status)
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

	if order.Status != "paid" || order.Payment == nil || order.Payment.Status != "paid" {
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
		order.Status = "paid"
		order.Payment.Status = "paid"
		webhookLog.Status = "processed_paid"
	case "EXPIRED":
		if order.Status == "pending" {
			if err := s.restoreInventoryWithTx(tx, order); err != nil {
				tx.Rollback()
				return err
			}
		}
		order.Status = "expired"
		order.Payment.Status = "expired"
		webhookLog.Status = "processed_expired"
	case "FAILED":
		if order.Status == "pending" {
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
