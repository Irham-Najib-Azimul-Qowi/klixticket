package models

import (
	"time"

	"gorm.io/gorm"
)

type Event struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	Title         string         `gorm:"type:varchar(255);not null;index" json:"title"`
	Slug          string         `gorm:"type:varchar(255);uniqueIndex;not null" json:"slug"`
	Description   string         `gorm:"type:text" json:"description"`
	Location      string         `gorm:"type:varchar(255);not null" json:"location"`
	StartDate     time.Time      `gorm:"not null;index" json:"start_date"`
	EndDate       time.Time      `gorm:"not null;index" json:"end_date"`
	BannerURL     *string        `gorm:"type:varchar(255)" json:"banner_url"`
	PublishStatus string         `gorm:"type:varchar(20);not null;default:'draft';index" json:"publish_status"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
	TicketTypes   []TicketType   `gorm:"foreignKey:EventID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"ticket_types,omitempty"`
	Lineup        []LineupItem   `gorm:"foreignKey:EventID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"lineup,omitempty"`
}

type TicketType struct {
	ID             uint           `gorm:"primaryKey" json:"id"`
	EventID        uint           `gorm:"not null;index;uniqueIndex:idx_ticket_types_event_name" json:"event_id"`
	Name           string         `gorm:"type:varchar(100);not null;uniqueIndex:idx_ticket_types_event_name" json:"name"`
	Description    string         `gorm:"type:text" json:"description"`
	Price          float64        `gorm:"type:decimal(12,2);not null" json:"price"`
	Quota          int            `gorm:"not null;check:quota >= 0" json:"quota"`
	RemainingQuota int            `gorm:"not null;check:remaining_quota >= 0" json:"remaining_quota"`
	SalesStartAt   time.Time      `gorm:"not null;index" json:"sales_start_at"`
	SalesEndAt     time.Time      `gorm:"not null;index" json:"sales_end_at"`
	ActiveStatus   bool           `gorm:"not null;default:true;index" json:"active_status"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`
	Event          *Event         `gorm:"foreignKey:EventID" json:"event,omitempty"`
}
