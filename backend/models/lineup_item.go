package models

type LineupItem struct {
	ID      uint    `gorm:"primaryKey" json:"id"`
	EventID uint    `gorm:"not null;index" json:"event_id"`
	Name    string  `gorm:"type:varchar(255);not null" json:"name"`
	ImageURL *string `gorm:"type:varchar(255)" json:"image_url"`
}
