package repositories

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"mastutik-api/dto"
	"mastutik-api/models"
)

type OrderRepository interface {
	// Transaction
	BeginTx(ctx context.Context) *gorm.DB

	FindTicketTypeWithLock(tx *gorm.DB, ticketID uint) (*models.TicketType, error)
	UpdateTicketQuota(tx *gorm.DB, id uint, quota int) error
	DecrementTicketQuota(tx *gorm.DB, id uint, quantity int) error
	FindOrderByIdempotencyKey(ctx context.Context, key string) (*models.Order, error)

	// Create
	CreateOrderWithTx(tx *gorm.DB, order *models.Order) error

	// Read
	FindOrdersByUserID(ctx context.Context, userID uint, limit, offset int, filter string) ([]models.Order, error)
	FindOrderByID(ctx context.Context, orderID string) (*models.Order, error)
	FindOrderByIDWithTx(tx *gorm.DB, orderID string) (*models.Order, error)

	FindAllOrdersAdmin(ctx context.Context, limit, offset int, status, paymentStatus string) ([]models.Order, error)
	FindOrderByIDAdmin(ctx context.Context, orderID string) (*models.Order, error)
	GetPaidRevenueSummary(ctx context.Context) (float64, error)
	GetPaidTicketsSoldSummary(ctx context.Context) (int64, error)
	GetDailyPaidSales(ctx context.Context, startDate, endDate time.Time) ([]dto.SalesAggregate, error)

	// Update Payment
	FindPaymentByOrderID(ctx context.Context, orderID string) (*models.Payment, error)
	UpdatePaymentStatus(ctx context.Context, payment *models.Payment) error
	UpdatePaymentStatusWithTx(tx *gorm.DB, payment *models.Payment) error
	UpdateOrderStatus(ctx context.Context, order *models.Order) error
	UpdateOrderStatusWithTx(tx *gorm.DB, order *models.Order) error
	FindWebhookLogByInvoiceID(ctx context.Context, invoiceID string) (*models.PaymentWebhookLog, error)
	CreateWebhookLogWithTx(tx *gorm.DB, webhookLog *models.PaymentWebhookLog) error
	UpdateWebhookLogWithTx(tx *gorm.DB, webhookLog *models.PaymentWebhookLog) error
	CountPaidOrders(ctx context.Context) (int64, error)
	CountAll(ctx context.Context) (int64, error)
}

type orderRepository struct {
	db *gorm.DB
}

func NewOrderRepository(db *gorm.DB) OrderRepository {
	return &orderRepository{db}
}

func (r *orderRepository) BeginTx(ctx context.Context) *gorm.DB {
	return r.db.WithContext(ctx).Begin()
}

func orderSelectColumns(db *gorm.DB) *gorm.DB {
	return db.Select(
		"id",
		"user_id",
		"status",
		"total_amount",
		"created_at",
		"updated_at",
		"expired_at",
		"checked_in_at",
		"checked_in_by",
	)
}

func paymentSelectColumns(db *gorm.DB) *gorm.DB {
	return db.Select(
		"id",
		"order_id",
		"xendit_invoice_id",
		"checkout_url",
		"status",
		"created_at",
		"updated_at",
	)
}

func orderItemSelectColumns(db *gorm.DB) *gorm.DB {
	return db.Select(
		"id",
		"order_id",
		"item_type",
		"item_name",
		"ticket_type_id",
		"merchandise_id",
		"quantity",
		"price_per_item",
		"created_at",
	)
}

func userSelectColumns(db *gorm.DB) *gorm.DB {
	return db.Select(
		"id",
		"name",
		"email",
		"role",
		"created_at",
		"updated_at",
	)
}

func ticketTypeOrderSelectColumns(db *gorm.DB) *gorm.DB {
	return db.Select(
		"id",
		"event_id",
		"name",
		"price",
		"sales_start_at",
		"sales_end_at",
		"active_status",
	)
}

func merchandiseOrderSelectColumns(db *gorm.DB) *gorm.DB {
	return db.Select(
		"id",
		"name",
		"slug",
		"price",
		"stock",
		"image_url",
		"active_status",
	)
}

func orderDetailPreloads(db *gorm.DB) *gorm.DB {
	return orderSelectColumns(db).
		Preload("User", func(preloadDB *gorm.DB) *gorm.DB {
			return userSelectColumns(preloadDB)
		}).
		Preload("Payment", func(preloadDB *gorm.DB) *gorm.DB {
			return paymentSelectColumns(preloadDB)
		}).
		Preload("OrderItems", func(preloadDB *gorm.DB) *gorm.DB {
			return orderItemSelectColumns(preloadDB).Order("id asc")
		}).
		Preload("OrderItems.TicketType", func(preloadDB *gorm.DB) *gorm.DB {
			return ticketTypeOrderSelectColumns(preloadDB)
		}).
		Preload("OrderItems.Merchandise", func(preloadDB *gorm.DB) *gorm.DB {
			return merchandiseOrderSelectColumns(preloadDB)
		})
}

func (r *orderRepository) CreateOrderWithTx(tx *gorm.DB, order *models.Order) error {
	/*
		Kita butuh transaction karena:
		1. Bikin Order
		2. Bikin OrderItems
		3. Bikin Payment pending
		4. MENGURANGI kuota Ticket (Update TicketType)
		Jika salah satu gagal, semua harus rollback.
	*/
	return tx.Create(order).Error
}

func (r *orderRepository) FindOrdersByUserID(ctx context.Context, userID uint, limit, offset int, filter string) ([]models.Order, error) {
	var orders []models.Order

	query := orderSelectColumns(r.db.WithContext(ctx)).
		Preload("OrderItems.TicketType").
		Preload("OrderItems.Merchandise").
		Preload("Payment", func(preloadDB *gorm.DB) *gorm.DB {
			return paymentSelectColumns(preloadDB)
		}).
		Where("user_id = ?", userID)

	now := time.Now()

	switch filter {
	case "active":
		// Tiket Aktif: sudah dibayar, belum check-in, dan belum expired
		query = query.Where("status = ?", "paid").
			Where("checked_in_at IS NULL").
			Where("expired_at > ?", now)
	case "history":
		// Riwayat: sudah check-in ATAU sudah expired ATAU status bukan paid
		query = query.Where(
			r.db.Where("checked_in_at IS NOT NULL").
				Or("expired_at <= ?", now).
				Or("status <> ?", "paid"),
		)
	default:
		// Jika tidak ada filter, kembalikan semua yang terbaru
	}

	err := query.
		Order("created_at desc").
		Limit(limit).
		Offset(offset).
		Find(&orders).Error
	return orders, err
}

func (r *orderRepository) FindOrderByID(ctx context.Context, orderID string) (*models.Order, error) {
	// Guard against non-UUID strings to prevent DB errors
	if _, err := uuid.Parse(orderID); err != nil {
		return nil, gorm.ErrRecordNotFound
	}

	var order models.Order

	err := orderDetailPreloads(r.db.WithContext(ctx)).
		Where("id = ?", orderID).
		First(&order).Error
	if err != nil {
		return nil, err
	}

	return &order, nil
}

func (r *orderRepository) FindOrderByIDWithTx(tx *gorm.DB, orderID string) (*models.Order, error) {
	// Guard against non-UUID strings to prevent DB errors
	if _, err := uuid.Parse(orderID); err != nil {
		return nil, gorm.ErrRecordNotFound
	}

	var order models.Order

	err := orderDetailPreloads(tx).
		Clauses(clause.Locking{Strength: "UPDATE"}).
		Where("orders.id = ?", orderID).
		First(&order).Error
	if err != nil {
		return nil, err
	}

	return &order, nil
}

func (r *orderRepository) FindAllOrdersAdmin(ctx context.Context, limit, offset int, status, paymentStatus string) ([]models.Order, error) {
	var orders []models.Order

	query := orderDetailPreloads(r.db.WithContext(ctx))
	if status != "" {
		query = query.Where("orders.status = ?", status)
	}
	if paymentStatus != "" {
		query = query.Joins("LEFT JOIN payments ON payments.order_id = orders.id").
			Where("payments.status = ?", paymentStatus)
	}

	err := query.
		Order("orders.created_at desc").
		Limit(limit).
		Offset(offset).
		Find(&orders).Error
	return orders, err
}

func (r *orderRepository) FindOrderByIDAdmin(ctx context.Context, orderID string) (*models.Order, error) {
	return r.FindOrderByID(ctx, orderID)
}

func (r *orderRepository) GetPaidRevenueSummary(ctx context.Context) (float64, error) {
	var result struct {
		Revenue float64
	}

	err := r.db.WithContext(ctx).
		Model(&models.Order{}).
		Select("COALESCE(SUM(total_amount), 0) AS revenue").
		Where("status = ?", "paid").
		Scan(&result).Error
	return result.Revenue, err
}

func (r *orderRepository) GetPaidTicketsSoldSummary(ctx context.Context) (int64, error) {
	var result struct {
		TicketsSold int64
	}

	err := r.db.WithContext(ctx).
		Table("order_items").
		Select("COALESCE(SUM(order_items.quantity), 0) AS tickets_sold").
		Joins("JOIN orders ON orders.id = order_items.order_id").
		Where("orders.status = ?", "paid").
		Where("order_items.item_type = ?", "ticket").
		Scan(&result).Error
	return result.TicketsSold, err
}

func (r *orderRepository) GetDailyPaidSales(ctx context.Context, startDate, endDate time.Time) ([]dto.SalesAggregate, error) {
	var rows []dto.SalesAggregate

	err := r.db.WithContext(ctx).
		Table("payments").
		Select("DATE(payments.updated_at) AS date, COALESCE(SUM(orders.total_amount), 0) AS revenue").
		Joins("JOIN orders ON orders.id = payments.order_id").
		Where("payments.status = ?", "paid").
		Where("payments.updated_at >= ?", startDate).
		Where("payments.updated_at < ?", endDate.Add(24*time.Hour)).
		Group("DATE(payments.updated_at)").
		Order("DATE(payments.updated_at) asc").
		Scan(&rows).Error
	return rows, err
}

func (r *orderRepository) FindPaymentByOrderID(ctx context.Context, orderID string) (*models.Payment, error) {
	var payment models.Payment
	err := paymentSelectColumns(r.db.WithContext(ctx)).Where("order_id = ?", orderID).First(&payment).Error
	if err != nil {
		return nil, errors.New("payment not found")
	}
	return &payment, nil
}

func (r *orderRepository) UpdatePaymentStatus(ctx context.Context, payment *models.Payment) error {
	return r.db.WithContext(ctx).Save(payment).Error
}

func (r *orderRepository) UpdatePaymentStatusWithTx(tx *gorm.DB, payment *models.Payment) error {
	return tx.Save(payment).Error
}

func (r *orderRepository) UpdateOrderStatus(ctx context.Context, order *models.Order) error {
	return r.db.WithContext(ctx).Save(order).Error
}

func (r *orderRepository) UpdateOrderStatusWithTx(tx *gorm.DB, order *models.Order) error {
	return tx.Save(order).Error
}

func (r *orderRepository) FindWebhookLogByInvoiceID(ctx context.Context, invoiceID string) (*models.PaymentWebhookLog, error) {
	var webhookLog models.PaymentWebhookLog

	err := r.db.WithContext(ctx).
		Where("xendit_invoice_id = ?", invoiceID).
		First(&webhookLog).Error
	if err != nil {
		return nil, err
	}

	return &webhookLog, nil
}

func (r *orderRepository) CreateWebhookLogWithTx(tx *gorm.DB, webhookLog *models.PaymentWebhookLog) error {
	return tx.Create(webhookLog).Error
}

func (r *orderRepository) UpdateWebhookLogWithTx(tx *gorm.DB, webhookLog *models.PaymentWebhookLog) error {
	return tx.Save(webhookLog).Error
}

func (r *orderRepository) FindTicketTypeWithLock(tx *gorm.DB, ticketID uint) (*models.TicketType, error) {
	var ticketType models.TicketType

	err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&ticketType, ticketID).Error
	if err != nil {
		return nil, err
	}

	return &ticketType, nil
}

func (r *orderRepository) UpdateTicketQuota(tx *gorm.DB, id uint, quota int) error {
	return tx.Model(&models.TicketType{}).Where("id = ?", id).Update("remaining_quota", quota).Error
}

func (r *orderRepository) DecrementTicketQuota(tx *gorm.DB, id uint, quantity int) error {
	// Atomic update with check: update ticket_types set remaining_quota = remaining_quota - X where id = Y and remaining_quota >= X
	result := tx.Model(&models.TicketType{}).
		Where("id = ? AND remaining_quota >= ?", id, quantity).
		Update("remaining_quota", gorm.Expr("remaining_quota - ?", quantity))

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return errors.New("insufficient quota")
	}

	return nil
}

func (r *orderRepository) FindOrderByIdempotencyKey(ctx context.Context, key string) (*models.Order, error) {
	var order models.Order
	err := orderDetailPreloads(r.db.WithContext(ctx)).
		Where("idempotency_key = ?", key).
		First(&order).Error
	if err != nil {
		return nil, err
	}
	return &order, nil
}

func (r *orderRepository) CountPaidOrders(ctx context.Context) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&models.Order{}).Where("status = ?", "paid").Count(&count).Error
	return count, err
}

func (r *orderRepository) CountAll(ctx context.Context) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&models.Order{}).Count(&count).Error
	return count, err
}
