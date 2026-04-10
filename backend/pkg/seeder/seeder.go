package seeder

import (
	"errors"
	"log"
	"os"
	"strings"
	"time"

	"gorm.io/gorm"

	"mastutik-api/models"
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
	
	hashedPassword, hashErr := utils.HashPassword(adminPassword)
	if hashErr != nil {
		return hashErr
	}

	if err == nil {
		// User exists, update role and password to match .env
		existingUser.Role = "admin"
		existingUser.PasswordHash = &hashedPassword
		if saveErr := db.Save(&existingUser).Error; saveErr != nil {
			return saveErr
		}
		log.Printf("Admin user updated/synced: %s", adminEmail)
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	} else {
		admin := &models.User{
			Name:         adminName,
			Email:        adminEmail,
			PasswordHash: &hashedPassword,
			Role:         "admin",
		}

		if err := db.Create(admin).Error; err != nil {
			return err
		}
		log.Printf("Admin user created: %s", adminEmail)
	}

	if err := SeedEvents(db); err != nil {
		log.Printf("Warning: event seeder error: %v", err)
	}
	if err := SeedMerchandise(db); err != nil {
		log.Printf("Warning: merchandise seeder error: %v", err)
	}

	return nil
}



func SeedEvents(db *gorm.DB) error {
	now := time.Now()
	
	events := []models.Event{
		{
			Title:         "GIXS DI KOTA",
			Slug:          "gixs-di-kota",
			Description:   "Event musik paling dinanti di kota ini! Menampilkan deretan musisi lokal dan nasional yang akan menggetarkan panggung GIXS 2026.",
			Location:      "Lapangan Merdeka, Kota",
			StartDate:     time.Date(2026, 8, 15, 15, 0, 0, 0, now.Location()),
			EndDate:       time.Date(2026, 8, 15, 23, 0, 0, 0, now.Location()),
			BannerURL:     ptr("/uploads/images/events/gixs.webp"),
			PublishStatus: "published",
			TicketTypes: []models.TicketType{
				{
					Name: "Presale 1", 
					Price: 40000, 
					Quota: 200, 
					RemainingQuota: 0, // SOLD OUT
					SalesStartAt: now.AddDate(0, -2, 0), 
					SalesEndAt: now.AddDate(0, -1, 0), 
					ActiveStatus: true,
				},
				{
					Name: "Presale 2", 
					Price: 50000, 
					Quota: 300, 
					RemainingQuota: 0, // SOLD OUT
					SalesStartAt: now.AddDate(0, -1, 0), 
					SalesEndAt: now.Add(24 * time.Hour), 
					ActiveStatus: true,
				},
				{
					Name: "On The Spot (OTS)", 
					Price: 70000, 
					Quota: 50, 
					RemainingQuota: 50, 
					SalesStartAt: now.Add(48 * time.Hour), 
					SalesEndAt: time.Date(2026, 8, 15, 22, 0, 0, 0, now.Location()), 
					ActiveStatus: true,
				},
			},
		},
	}

	for _, event := range events {
		var existing models.Event
		if err := db.Where("slug = ?", event.Slug).Preload("TicketTypes").First(&existing).Error; err == nil {
			// Event exists, update its basic info and tickets
			event.ID = existing.ID
			db.Model(&existing).Updates(event)

			// Sync Ticket Types
			for _, tt := range event.TicketTypes {
				db.Model(&models.TicketType{}).
					Where("event_id = ? AND name = ?", existing.ID, tt.Name).
					Updates(map[string]interface{}{
						"price":           tt.Price,
						"quota":           tt.Quota,
						"remaining_quota": tt.RemainingQuota,
						"active_status":   true,
						"sales_start_at":  tt.SalesStartAt,
						"sales_end_at":    tt.SalesEndAt,
					})
			}
		} else {
			// New event, create it
			if err := db.Create(&event).Error; err != nil {
				log.Printf("Warning: failed to seed event '%s': %v", event.Title, err)
			}
		}
	}

	log.Println("Event seeder enriched successfully!")
	return nil
}

func SeedMerchandise(db *gorm.DB) error {
	merchandise := []models.Merchandise{
		{
			Name: "DIANGKAT PNS TEE", 
			Slug: "diangkat-pns-tee", 
			Description: "Kaos sablon eksklusif dengan tema humor lokal yang ikonik. Bahan 100% cotton combed 30s.", 
			Price: 180000, 
			Stock: 100, 
			ImageURL: ptr("/uploads/images/merchandise/tee.webp"), 
			ActiveStatus: true,
		},
		{
			Name: "TUMBLR MINOEMAN XERAS - BLACK", 
			Slug: "tumblr-minoman-xeras-black", 
			Description: "Tumblr stainless steel 500ml tahan panas dan dingin. Desain minimalis warna hitam pekat.", 
			Price: 100000, 
			Stock: 50, 
			ImageURL: ptr("/uploads/images/merchandise/tumblr-black.jpeg"), 
			ActiveStatus: true,
		},
		{
			Name: "TUMBLR MINOEMAN XERAS - WHITE", 
			Slug: "tumblr-minoman-xeras-white", 
			Description: "Tumblr stainless steel 500ml tahan panas dan dingin. Desain minimalis warna putih bersih.", 
			Price: 100000, 
			Stock: 50, 
			ImageURL: ptr("/uploads/images/merchandise/tumblr-white.jpeg"), 
			ActiveStatus: true,
		},
		{
			Name: "TUMBLR MINOEMAN XERAS - SILVER", 
			Slug: "tumblr-minoman-xeras-silver", 
			Description: "Tumblr stainless steel 500ml tahan panas dan dingin. Tampilan elegan dengan finishing silver metallic.", 
			Price: 100000, 
			Stock: 50, 
			ImageURL: ptr("/uploads/images/merchandise/tumblr-silver.jpeg"), 
			ActiveStatus: true,
		},
	}

	for _, merch := range merchandise {
		var existing models.Merchandise
		if db.Where("slug = ?", merch.Slug).First(&existing).Error != nil {
			if err := db.Create(&merch).Error; err != nil {
				log.Printf("Warning: failed to seed merchandise '%s': %v", merch.Name, err)
			}
		} else {
			// Update existing items
			merch.ID = existing.ID
			db.Model(&existing).Updates(merch)
		}
	}

	log.Println("Merchandise seeder enriched successfully!")
	return nil
}

func ptr(s string) *string {
	return &s
}