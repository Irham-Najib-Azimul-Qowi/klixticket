package models

import (
	"time"
)

type Event struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Title       string    `gorm:"type:varchar(255);not null" json:"title" binding:"required"`
	Description string    `gorm:"type:text" json:"description"`
	Location    string    `gorm:"type:varchar(255);not null" json:"location" binding:"required"`
	Date        time.Time `json:"date" binding:"required"`
	Price       int       `json:"price" binding:"required,min=0"`
	Quota       int       `json:"quota" binding:"required,min=1"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
