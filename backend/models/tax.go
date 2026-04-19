package models

import (
	"time"

	"github.com/google/uuid"
)

type Tax struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Name         string    `gorm:"type:varchar(100);not null" json:"name"`
	Percentage   float64   `gorm:"type:decimal(5,2);not null" json:"percentage"`
	ActiveStatus bool      `gorm:"default:true" json:"active_status"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type OrderTax struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	OrderID       uuid.UUID `gorm:"type:uuid;not null;index" json:"order_id"`
	TaxID         uint      `gorm:"not null" json:"tax_id"`
	TaxName       string    `gorm:"type:varchar(100);not null" json:"tax_name"`
	TaxPercentage float64   `gorm:"type:decimal(5,2);not null" json:"tax_percentage"`
	Amount        float64   `gorm:"type:decimal(12,2);not null" json:"amount"`
	CreatedAt     time.Time `json:"created_at"`
}
