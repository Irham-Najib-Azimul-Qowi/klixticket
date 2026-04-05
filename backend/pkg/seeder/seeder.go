package seeder

import (
	"errors"
	"log"
	"os"
	"strings"

	"gorm.io/gorm"

	"mastutik-api/internal/models"
	"mastutik-api/pkg/utils"
)

func SeedAdmin(db *gorm.DB) error {
	adminEmail := strings.TrimSpace(os.Getenv("ADMIN_EMAIL"))
	adminPassword := os.Getenv("ADMIN_PASSWORD")
	adminName := strings.TrimSpace(os.Getenv("ADMIN_NAME"))

	if adminEmail == "" || adminPassword == "" {
		log.Println("Info: admin seeder skipped because ADMIN_EMAIL or ADMIN_PASSWORD is empty")
		return nil
	}

	if adminName == "" {
		adminName = "System Admin"
	}

	var existingUser models.User
	err := db.Where("email = ?", adminEmail).First(&existingUser).Error
	if err == nil {
		if existingUser.Role != "admin" {
			existingUser.Role = "admin"
			if saveErr := db.Save(&existingUser).Error; saveErr != nil {
				return saveErr
			}
		}
		return nil
	}

	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}

	hashedPassword, err := utils.HashPassword(adminPassword)
	if err != nil {
		return err
	}

	admin := &models.User{
		Name:         adminName,
		Email:        adminEmail,
		PasswordHash: &hashedPassword,
		Role:         "admin",
	}

	return db.Create(admin).Error
}
