package models

import (
	"time"

	"gorm.io/gorm"
)

type Merchandise struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	Name         string         `gorm:"type:varchar(150);not null;index" json:"name"`
	Slug         string         `gorm:"type:varchar(180);uniqueIndex;not null" json:"slug"`
	Description  string         `gorm:"type:text" json:"description"`
	Price        float64        `gorm:"type:decimal(12,2);not null" json:"price"`
	Stock        int            `gorm:"not null;check:stock >= 0" json:"stock"`
	ImageURL     *string        `gorm:"type:varchar(255)" json:"image_url"`
	ActiveStatus bool           `gorm:"not null;default:true;index" json:"active_status"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}
