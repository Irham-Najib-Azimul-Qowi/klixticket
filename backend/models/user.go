package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	Name         string         `gorm:"type:varchar(100);not null" json:"name"`
	Email        string         `gorm:"type:varchar(100);uniqueIndex;not null" json:"email"`
	PasswordHash *string        `gorm:"type:varchar(255)" json:"-"`                      // Pointer agar bisa null untuk yang daftar via Google
	Role         string         `gorm:"type:varchar(20);default:'customer'" json:"role"` // 'customer' atau 'admin'
	AvatarURL    *string        `gorm:"type:varchar(255)" json:"avatar_url"`
	ResetPasswordToken     *string        `gorm:"type:varchar(255);index" json:"-"`
	ResetPasswordExpiresAt *time.Time     `json:"-"`
	CreatedAt              time.Time      `json:"created_at"`
	UpdatedAt              time.Time      `json:"updated_at"`
	DeletedAt              gorm.DeletedAt `gorm:"index" json:"-"`
}

type OAuthAccount struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	UserID         uint      `gorm:"not null" json:"user_id"`
	User           User      `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"-"`
	Provider       string    `gorm:"type:varchar(50);not null" json:"provider"`          // ex: "google"
	ProviderUserID string    `gorm:"type:varchar(100);not null" json:"provider_user_id"` // ID unik dari Google
	CreatedAt      time.Time `json:"created_at"`
}
