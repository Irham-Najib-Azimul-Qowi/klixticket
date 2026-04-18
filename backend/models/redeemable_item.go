package models

import (
	"github.com/google/uuid"
	"time"
)

type RedeemableItem struct {
	ID           uint       `gorm:"primaryKey" json:"id"`
	OrderID      uuid.UUID  `gorm:"type:uuid;not null;index" json:"order_id"`
	OrderItemID  uint       `gorm:"not null;index" json:"order_item_id"`
	ItemType     string     `gorm:"type:varchar(20);not null" json:"item_type"` // 'ticket', 'merchandise'
	ItemName     string     `gorm:"type:varchar(255);not null" json:"item_name"`
	Code         string     `gorm:"type:varchar(100);uniqueIndex" json:"code"`
	Status       string     `gorm:"type:varchar(30);default:'belum_digunakan';index" json:"status"` // 'belum_digunakan', 'sudah_digunakan', 'tidak_berlaku'
	UsedAt       *time.Time `json:"used_at,omitempty"`
	UsedBy       *uint      `json:"used_by,omitempty"`        // Admin ID
	EventEndDate *time.Time `json:"event_end_date,omitempty"` // Explicit copy for easy filtering
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}
