package models

import (
	"github.com/google/uuid"
	"time"
)

const (
	ItemStatusUnused  = "UNUSED"
	ItemStatusUsed    = "USED"
	ItemStatusExpired = "EXPIRED"
)

type RedeemableItem struct {
	ID           uint       `gorm:"primaryKey" json:"id"`
	OrderID      uuid.UUID  `gorm:"type:uuid;not null;index" json:"order_id"`
	OrderItemID  uint       `gorm:"not null;index" json:"order_item_id"`
	ItemType     string     `gorm:"type:varchar(20);not null" json:"item_type"` // 'ticket', 'merchandise'
	ItemName     string     `gorm:"type:varchar(255);not null" json:"item_name"`
	Code         string     `gorm:"type:varchar(100);uniqueIndex" json:"code"`
	Status       string     `gorm:"type:varchar(30);default:'UNUSED';index" json:"status"` // 'UNUSED', 'USED'
	UsedAt       *time.Time `json:"used_at,omitempty"`
	UsedBy       *uint      `json:"used_by,omitempty"`        // Admin ID
	EventEndDate *time.Time `json:"event_end_date,omitempty"` // Explicit copy for easy dynamic check
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

// GetEffectiveStatus computes the real-time status based on usage and expiration rules
func (r *RedeemableItem) GetEffectiveStatus() string {
	// If already manually marked as USED by admin
	if r.Status == ItemStatusUsed {
		return ItemStatusUsed
	}

	// Dynamic expiration check for tickets only
	if r.ItemType == "ticket" && r.EventEndDate != nil {
		if time.Now().After(*r.EventEndDate) {
			return ItemStatusExpired
		}
	}

	return ItemStatusUnused
}
