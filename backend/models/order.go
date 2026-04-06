package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Order struct {
	ID          uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID      uint           `gorm:"not null" json:"user_id"`
	User        User           `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;" json:"user,omitempty"`
	Status      string         `gorm:"type:varchar(20);default:'pending'" json:"status"` // 'pending', 'paid', 'failed', 'expired', 'cancelled'
	TotalAmount float64        `gorm:"type:decimal(12,2);not null" json:"total_amount"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	ExpiredAt   time.Time      `gorm:"not null" json:"expired_at"` // order akan kadaluarsa misal dalam 24 jam
	CheckedInAt *time.Time     `gorm:"index" json:"checked_in_at"`
	CheckedInBy *uint          `gorm:"index" json:"checked_in_by,omitempty"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	OrderItems  []OrderItem    `gorm:"foreignKey:OrderID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"order_items,omitempty"`
	Payment     *Payment       `gorm:"foreignKey:OrderID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"payment,omitempty"`
}

type OrderItem struct {
	ID            uint         `gorm:"primaryKey" json:"id"`
	OrderID       uuid.UUID    `gorm:"type:uuid;not null;index" json:"order_id"`
	ItemType      string       `gorm:"type:varchar(20);not null;index" json:"item_type"`
	ItemName      string       `gorm:"type:varchar(255);not null" json:"item_name"`
	TicketTypeID  *uint        `gorm:"index" json:"ticket_type_id,omitempty"`
	TicketType    *TicketType  `gorm:"foreignKey:TicketTypeID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;" json:"ticket_type,omitempty"`
	MerchandiseID *uint        `gorm:"index" json:"merchandise_id,omitempty"`
	Merchandise   *Merchandise `gorm:"foreignKey:MerchandiseID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;" json:"merchandise,omitempty"`
	Quantity      int          `gorm:"not null" json:"quantity"`
	PricePerItem  float64      `gorm:"type:decimal(10,2);not null" json:"price_per_item"`
	CreatedAt     time.Time    `json:"created_at"`
}

type Payment struct {
	ID              uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	OrderID         uuid.UUID `gorm:"type:uuid;uniqueIndex;not null" json:"order_id"`
	XenditInvoiceID string    `gorm:"type:varchar(255);uniqueIndex" json:"xendit_invoice_id"`
	CheckoutURL     string    `gorm:"type:text" json:"checkout_url"`
	Status          string    `gorm:"type:varchar(20);default:'pending'" json:"status"` // 'pending', 'paid', 'expired', 'failed'
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

type PaymentWebhookLog struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	XenditInvoiceID string    `gorm:"type:varchar(255);uniqueIndex;not null" json:"xendit_invoice_id"`
	Payload         string    `gorm:"type:text;not null" json:"payload"` // raw JSON
	Status          string    `gorm:"type:varchar(50)" json:"status"`    // result status processed
	CreatedAt       time.Time `json:"created_at"`
}
