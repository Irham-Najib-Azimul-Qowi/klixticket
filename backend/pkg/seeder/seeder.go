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
	if err := SeedUser(db); err != nil {
		log.Printf("Warning: user seeder error: %v", err)
	}

	return nil
}

func SeedUser(db *gorm.DB) error {
	var count int64
	db.Model(&models.User{}).Where("role = ?", "user").Count(&count)
	if count > 0 {
		return nil
	}

	password := "User123!"
	hashedPassword, err := utils.HashPassword(password)
	if err != nil {
		return err
	}

	user := &models.User{
		Name:         "Budi Santoso",
		Email:        "budi@gmail.com",
		PasswordHash: &hashedPassword,
		Role:         "user",
	}

	if err := db.Create(user).Error; err != nil {
		return err
	}
	log.Printf("Non-admin user created: %s", user.Email)
	return nil
}

func SeedEvents(db *gorm.DB) error {
	now := time.Now()
	
	events := []models.Event{
		{
			Title:         "RAN Membawakan J-ROCKS",
			Slug:          "ran-membawakan-j-rocks-2026",
			Description:   "RAN tampil memukau membawakan lagu-lagu hits J-ROCKS di panggung utama Connected 2026. Sebuah kolaborasi lintas genre yang belum pernah ada sebelumnya di Madiun.",
			Location:      "Boss Stage, Madiun",
			StartDate:     time.Date(2026, 9, 5, 15, 0, 0, 0, now.Location()),
			EndDate:       time.Date(2026, 9, 5, 17, 0, 0, 0, now.Location()),
			BannerURL:     ptr("https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=1200"),
			PublishStatus: "published",
			TicketTypes: []models.TicketType{
				{Name: "General Admission", Price: 350000, Quota: 800, RemainingQuota: 450, SalesStartAt: now.AddDate(0, -1, 0), SalesEndAt: now.AddDate(0, 5, 0), ActiveStatus: true},
			},
		},
		{
			Title:         "TENXI, JEMSII, NAYKILLA",
			Slug:          "tenxi-jemsii-naykilla-2026",
			Description:   "Triple bill yang bakal bikin lantai dansa goyang nonstop! TENXI, JEMSII, dan NAYKILLA hadir serentak di Sat-Set Stage Connected 2026.",
			Location:      "Sat-Set Stage, Madiun",
			StartDate:     time.Date(2026, 9, 6, 19, 0, 0, 0, now.Location()),
			EndDate:       time.Date(2026, 9, 6, 23, 0, 0, 0, now.Location()),
			BannerURL:     ptr("https://images.unsplash.com/photo-1540039155732-684735035727?auto=format&fit=crop&q=80&w=1200"),
			PublishStatus: "published",
			TicketTypes: []models.TicketType{
				{Name: "Early Access", Price: 250000, Quota: 500, RemainingQuota: 200, SalesStartAt: now.AddDate(0, -1, 0), SalesEndAt: now.AddDate(0, 5, 0), ActiveStatus: true},
			},
		},
		{
			Title:         "Madiun Night Carnival",
			Slug:          "madiun-night-carnival-2026",
			Description:   "Parade seni dan budaya terbesar di Madiun. Menampilkan ratusan talenta lokal dengan kostum spektakuler dan atraksi lampu yang memukau.",
			Location:      "Pahlawan Street Center, Madiun",
			StartDate:     time.Date(2026, 6, 20, 19, 0, 0, 0, now.Location()),
			EndDate:       time.Date(2026, 6, 20, 23, 0, 0, 0, now.Location()),
			BannerURL:     ptr("https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=1200"),
			PublishStatus: "published",
			TicketTypes: []models.TicketType{
				{Name: "VIP Row", Price: 200000, Quota: 100, RemainingQuota: 50, SalesStartAt: now.AddDate(0, -1, 0), SalesEndAt: now.AddDate(0, 2, 0), ActiveStatus: true},
				{Name: "Festival", Price: 50000, Quota: 1000, RemainingQuota: 800, SalesStartAt: now.AddDate(0, -1, 0), SalesEndAt: now.AddDate(0, 2, 0), ActiveStatus: true},
			},
		},
		{
			Title:         "Electronic Dance Festival",
			Slug:          "edm-festival-madiun",
			Description:   "Madiun bergetar dengan dentuman musik elektronik dari DJ internasional dan lokal. Laser show dan sistem suara kelas dunia.",
			Location:      "Wilis Stadium, Madiun",
			StartDate:     time.Date(2026, 7, 15, 17, 0, 0, 0, now.Location()),
			EndDate:       time.Date(2026, 7, 16, 02, 0, 0, 0, now.Location()),
			BannerURL:     ptr("https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=1200"),
			PublishStatus: "published",
			TicketTypes: []models.TicketType{
				{Name: "GA Early", Price: 350000, Quota: 500, RemainingQuota: 100, SalesStartAt: now.AddDate(0, -2, 0), SalesEndAt: now.AddDate(0, 3, 0), ActiveStatus: true},
				{Name: "VIP Backstage", Price: 1500000, Quota: 50, RemainingQuota: 10, SalesStartAt: now.AddDate(0, -2, 0), SalesEndAt: now.AddDate(0, 3, 0), ActiveStatus: true},
			},
		},
		{
			Title:         "Festival Kuliner Nusantara",
			Slug:          "festival-kuliner-2026",
			Description:   "Menikmati sajian khas dari seluruh penjuru Indonesia dalam satu lokasi. Dilengkapi dengan demo masak chef ternama.",
			Location:      "Alun-alun Madiun",
			StartDate:     now.AddDate(0, 1, 0),
			EndDate:       now.AddDate(0, 1, 2),
			BannerURL:     ptr("https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=1200"),
			PublishStatus: "published",
			TicketTypes: []models.TicketType{
				{Name: "All-Day Pass", Price: 25000, Quota: 5000, RemainingQuota: 2500, SalesStartAt: now, SalesEndAt: now.AddDate(0, 2, 0), ActiveStatus: true},
			},
		},
		{
			Title:         "Indie Rock Concert: The SIGIT",
			Slug:          "the-sigit-live-madiun",
			Description:   "Unit rock kawakan asal Bandung siap menghentak Madiun! Persiapkan energi kalian untuk malam yang bising dan tak terlupakan.",
			Location:      "Gedung Tri Dharma, Madiun",
			StartDate:     now.AddDate(0, 2, 10),
			EndDate:       now.AddDate(0, 2, 10).Add(4 * time.Hour),
			BannerURL:     ptr("https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=1200"),
			PublishStatus: "published",
			TicketTypes: []models.TicketType{
				{Name: "Pre-sale", Price: 120000, Quota: 400, RemainingQuota: 150, SalesStartAt: now, SalesEndAt: now.AddDate(0, 3, 0), ActiveStatus: true},
			},
		},
		{
			Title:         "Workshop Photography: Street Soul",
			Slug:          "workshop-photography-2026",
			Description:   "Belajar teknik fotografi jalanan langsung dari fotografer profesional. Sesi teori dan hunting bersama di kota Madiun.",
			Location:      "Connected Studio, Madiun",
			StartDate:     now.AddDate(0, 0, 14),
			EndDate:       now.AddDate(0, 0, 14).Add(6 * time.Hour),
			BannerURL:     ptr("https://images.unsplash.com/photo-1452784444945-3f4227ec2f2e?auto=format&fit=crop&q=80&w=1200"),
			PublishStatus: "published",
			TicketTypes: []models.TicketType{
				{Name: "Full Session", Price: 500000, Quota: 20, RemainingQuota: 5, SalesStartAt: now.AddDate(0, -1, 0), SalesEndAt: now.AddDate(0, 1, 0), ActiveStatus: true},
			},
		},
		{
			Title:         "Yoga Sun & Glow",
			Slug:          "yoga-sun-glow-2026",
			Description:   "Sesi yoga bersama saat matahari terbit untuk ketenangan jiwa dan kebugaran tubuh. Dilengkapi dengan healthy breakfast.",
			Location:      "Taman Bantaran, Madiun",
			StartDate:     now.AddDate(0, 1, 5),
			EndDate:       now.AddDate(0, 1, 5).Add(3 * time.Hour),
			BannerURL:     ptr("https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1200"),
			PublishStatus: "published",
			TicketTypes: []models.TicketType{
				{Name: "Package A", Price: 75000, Quota: 50, RemainingQuota: 20, SalesStartAt: now, SalesEndAt: now.AddDate(0, 2, 0), ActiveStatus: true},
			},
		},
		{
			Title:         "E-Sport Championship: MLBB",
			Slug:          "esport-mlbb-madiun-2026",
			Description:   "Turnamen Mobile Legends terbesar di karesidenan Madiun. Total hadiah puluhan juta rupiah!",
			Location:      "Sun City Mall, Madiun",
			StartDate:     now.AddDate(0, 2, 20),
			EndDate:       now.AddDate(0, 2, 22),
			BannerURL:     ptr("https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200"),
			PublishStatus: "published",
			TicketTypes: []models.TicketType{
				{Name: "Spectator Pass", Price: 15000, Quota: 500, RemainingQuota: 400, SalesStartAt: now, SalesEndAt: now.AddDate(0, 3, 0), ActiveStatus: true},
			},
		},
		{
			Title:         "Connected Art Exhibition",
			Slug:          "art-exhibition-2026",
			Description:   "Pameran seni rupa kontemporer dari seniman lokal dan nasional. Menampilkan lukisan, instalasi, dan seni digital.",
			Location:      "Gedung Kesenian, Madiun",
			StartDate:     now.AddDate(0, 3, 0),
			EndDate:       now.AddDate(0, 3, 14),
			BannerURL:     ptr("https://images.unsplash.com/photo-1492691523567-6273c325d2a4?auto=format&fit=crop&q=80&w=1200"),
			PublishStatus: "published",
			TicketTypes: []models.TicketType{
				{Name: "General Entry", Price: 30000, Quota: 1000, RemainingQuota: 900, SalesStartAt: now, SalesEndAt: now.AddDate(0, 4, 0), ActiveStatus: true},
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
	var count int64
	db.Model(&models.Merchandise{}).Count(&count)
	if count >= 10 {
		log.Println("Info: merchandise seeder skipped, sufficient data already exists")
		return nil
	}

	merchandise := []models.Merchandise{
		{Name: "Connected Oversize Tee", Slug: "connected-tee-2026", Description: "Kaos premium 100% cotton combed 30s dengan artwork eksklusif.", Price: 180000, Stock: 150, ImageURL: ptr("https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800"), ActiveStatus: true},
		{Name: "Connected Hoodie", Slug: "connected-hoodie-2026", Description: "Hoodie fleece premium dengan embroidery logo.", Price: 385000, Stock: 80, ImageURL: ptr("https://images.unsplash.com/photo-1556821840-3a63f15732ce?auto=format&fit=crop&q=80&w=800"), ActiveStatus: true},
		{Name: "Lanyard: Connected Edition", Slug: "lanyard-connected", Description: "Lanyard lebar 2cm dengan print bolak balik.", Price: 35000, Stock: 200, ImageURL: ptr("https://images.unsplash.com/photo-1622219809260-ce065fc5277f?auto=format&fit=crop&q=80&w=800"), ActiveStatus: true},
		{Name: "Enamel Pin Set", Slug: "enamel-pin-set", Description: "Set isi 3 pin enamel dengan desain karakter Connected.", Price: 75000, Stock: 100, ImageURL: ptr("https://images.unsplash.com/photo-1590487988337-37418a03291d?auto=format&fit=crop&q=80&w=800"), ActiveStatus: true},
		{Name: "Metal Keychain", Slug: "metal-keychain", Description: "Gantungan kunci logam dengan ukiran logo.", Price: 45000, Stock: 150, ImageURL: ptr("https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800"), ActiveStatus: true},
		{Name: "Connected Bucket Hat", Slug: "bucket-hat-2026", Description: "Topi bucket dua sisi (reversible) warna hitam/salmon.", Price: 125000, Stock: 60, ImageURL: ptr("https://images.unsplash.com/photo-1556306535-0959288307f1?auto=format&fit=crop&q=80&w=800"), ActiveStatus: true},
		{Name: "Sticker Pack: Vol 1", Slug: "sticker-pack-v1", Description: "Paket sticker vinyl laminasi isi 10 desain.", Price: 25000, Stock: 500, ImageURL: ptr("https://images.unsplash.com/photo-1572375924201-49f70043a9cc?auto=format&fit=crop&q=80&w=800"), ActiveStatus: true},
		{Name: "Canvas Tote Bag", Slug: "canvas-tote-2026", Description: "Tas kanvas kuat untuk kebutuhan harian festival.", Price: 85000, Stock: 150, ImageURL: ptr("https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&q=80&w=800"), ActiveStatus: true},
		{Name: "Stainless Tumblr 500ml", Slug: "stainless-tumblr", Description: "Botol minum tahan panas/dingin khusus kolaborasi.", Price: 210000, Stock: 40, ImageURL: ptr("https://images.unsplash.com/photo-1602143307185-844875955bb6?auto=format&fit=crop&q=80&w=800"), ActiveStatus: true},
		{Name: "Tech Accessory Pouch", Slug: "tech-pouch-connected", Description: "Pouch untuk menyimpan kabel dan aksesoris gadget.", Price: 110000, Stock: 70, ImageURL: ptr("https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&q=80&w=800"), ActiveStatus: true},
	}

	for _, merch := range merchandise {
		var existing models.Merchandise
		if db.Where("slug = ?", merch.Slug).First(&existing).Error != nil {
			if err := db.Create(&merch).Error; err != nil {
				log.Printf("Warning: failed to seed merchandise '%s': %v", merch.Name, err)
			}
		}
	}

	log.Println("Merchandise seeder enriched successfully!")
	return nil
}

func ptr(s string) *string {
	return &s
}
