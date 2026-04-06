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
	if err == nil {
		if existingUser.Role != "admin" {
			existingUser.Role = "admin"
			if saveErr := db.Save(&existingUser).Error; saveErr != nil {
				return saveErr
			}
		}
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	} else {
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
	var count int64
	db.Model(&models.Event{}).Count(&count)
	if count > 0 {
		log.Println("Info: event seeder skipped, data already exists")
		return nil
	}

	now := time.Now()
	bannerRAN := "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=1200"
	bannerTENXI := "https://images.unsplash.com/photo-1540039155732-684735035727?auto=format&fit=crop&q=80&w=1200"
	bannerJROCKS := "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=1200"
	bannerDJ := "https://images.unsplash.com/photo-1571266752771-8522083d4a88?auto=format&fit=crop&q=80&w=1200"
	bannerAkustik := "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&q=80&w=1200"

	events := []models.Event{
		{
			Title:         "RAN Membawakan J-ROCKS",
			Slug:          "ran-membawakan-j-rocks-connected-2026",
			Description:   "RAN tampil memukau membawakan lagu-lagu hits J-ROCKS di panggung utama Connected 2026. Sebuah kolaborasi lintas genre yang belum pernah ada sebelumnya di Madiun. Nikmati pengalaman festival musik yang tak terlupakan bersama ribuan penonton.",
			Location:      "Boss Stage, Madiun",
			StartDate:     time.Date(2026, 9, 5, 15, 0, 0, 0, now.Location()),
			EndDate:       time.Date(2026, 9, 5, 17, 0, 0, 0, now.Location()),
			BannerURL:     &bannerRAN,
			PublishStatus: "published",
			TicketTypes: []models.TicketType{
				{
					Name:           "Presale 1",
					Description:    "Tiket terusan 3 hari - Akses semua stage",
					Price:          350000,
					Quota:          500,
					RemainingQuota: 0,
					SalesStartAt:   now.AddDate(0, -3, 0),
					SalesEndAt:     now.AddDate(0, -1, 0),
					ActiveStatus:   false,
				},
				{
					Name:           "Presale 2",
					Description:    "Tiket terusan 3 hari - Akses semua stage + Eksklusif Wristband",
					Price:          550000,
					Quota:          1000,
					RemainingQuota: 342,
					SalesStartAt:   now.AddDate(0, -1, 0),
					SalesEndAt:     time.Date(2026, 8, 30, 23, 59, 0, 0, now.Location()),
					ActiveStatus:   true,
				},
			},
		},
		{
			Title:         "TENXI, JEMSII, NAYKILLA",
			Slug:          "tenxi-jemsii-naykilla-connected-2026",
			Description:   "Triple bill yang bakal bikin lantai dansa goyang nonstop! TENXI, JEMSII, dan NAYKILLA hadir serentak di Sat-Set Stage Connected 2026. Bawa energi terbaikmu dan siapkan diri untuk malam yang paling panas di kota pendekar.",
			Location:      "Sat-Set Stage, Madiun",
			StartDate:     time.Date(2026, 9, 6, 19, 0, 0, 0, now.Location()),
			EndDate:       time.Date(2026, 9, 6, 23, 0, 0, 0, now.Location()),
			BannerURL:     &bannerTENXI,
			PublishStatus: "published",
			TicketTypes: []models.TicketType{
				{
					Name:           "Presale 2",
					Description:    "Tiket terusan 3 hari - Akses semua stage",
					Price:          550000,
					Quota:          1000,
					RemainingQuota: 217,
					SalesStartAt:   now.AddDate(0, -1, 0),
					SalesEndAt:     time.Date(2026, 8, 30, 23, 59, 0, 0, now.Location()),
					ActiveStatus:   true,
				},
			},
		},
		{
			Title:         "J-ROCKS Membawakan RAN",
			Slug:          "j-rocks-membawakan-ran-connected-2026",
			Description:   "Giliran J-ROCKS yang membalas! Band rock legendaris Indonesia ini akan membawakan lagu-lagu hits RAN dengan aransemen rock yang epic. Hingar Bingar Stage siap meledak malam itu. Jangan sampai kamu lewatkan momen bersejarah ini.",
			Location:      "Hingar Bingar Stage, Madiun",
			StartDate:     time.Date(2026, 9, 5, 20, 0, 0, 0, now.Location()),
			EndDate:       time.Date(2026, 9, 5, 22, 30, 0, 0, now.Location()),
			BannerURL:     &bannerJROCKS,
			PublishStatus: "published",
			TicketTypes: []models.TicketType{
				{
					Name:           "Presale 2",
					Description:    "Tiket terusan 3 hari - Akses semua stage + Eksklusif Wristband",
					Price:          550000,
					Quota:          1000,
					RemainingQuota: 489,
					SalesStartAt:   now.AddDate(0, -1, 0),
					SalesEndAt:     time.Date(2026, 8, 30, 23, 59, 0, 0, now.Location()),
					ActiveStatus:   true,
				},
			},
		},
		{
			Title:         "DJ DIPHA BARUS - Late Night Set",
			Slug:          "dj-dipha-barus-late-night-connected-2026",
			Description:   "Tutup malam dengan fire! DJ Dipha Barus akan menghadirkan late night set yang nonstop dari pukul 23.00 hingga 02.00. Electronic beats yang bakal bikin kamu lupa waktu. Ini dia penutup yang sempurna untuk hari pertama Connected 2026.",
			Location:      "Sat-Set Stage, Madiun",
			StartDate:     time.Date(2026, 9, 5, 23, 0, 0, 0, now.Location()),
			EndDate:       time.Date(2026, 9, 6, 2, 0, 0, 0, now.Location()),
			BannerURL:     &bannerDJ,
			PublishStatus: "published",
			TicketTypes: []models.TicketType{
				{
					Name:           "Festival Pass",
					Description:    "Tiket terusan 3 hari - Full access semua stage dan area",
					Price:          750000,
					Quota:          500,
					RemainingQuota: 128,
					SalesStartAt:   now.AddDate(0, -1, 0),
					SalesEndAt:     time.Date(2026, 8, 30, 23, 59, 0, 0, now.Location()),
					ActiveStatus:   true,
				},
			},
		},
		{
			Title:         "Akustik Session: Madiun Pride Night",
			Slug:          "akustik-session-madiun-pride-night-2026",
			Description:   "Malam yang hangat dan intim di bawah bintang. Madiun Pride Night menghadirkan sesi akustik dari musisi-musisi lokal terbaik Madiun Raya. Duduk santai, nikmati musik, dan rasakan kebanggaan sebagai bagian dari kota pendekar yang berbudaya.",
			Location:      "Acoustic Corner, Madiun",
			StartDate:     time.Date(2026, 9, 7, 17, 0, 0, 0, now.Location()),
			EndDate:       time.Date(2026, 9, 7, 21, 0, 0, 0, now.Location()),
			BannerURL:     &bannerAkustik,
			PublishStatus: "published",
			TicketTypes: []models.TicketType{
				{
					Name:           "Regular",
					Description:    "Akses ke Acoustic Corner area",
					Price:          150000,
					Quota:          300,
					RemainingQuota: 212,
					SalesStartAt:   now.AddDate(0, -1, 0),
					SalesEndAt:     time.Date(2026, 9, 7, 15, 0, 0, 0, now.Location()),
					ActiveStatus:   true,
				},
				{
					Name:           "VIP Table",
					Description:    "Meja VIP dengan minuman welcome drink dan snack",
					Price:          350000,
					Quota:          50,
					RemainingQuota: 18,
					SalesStartAt:   now.AddDate(0, -1, 0),
					SalesEndAt:     time.Date(2026, 9, 7, 15, 0, 0, 0, now.Location()),
					ActiveStatus:   true,
				},
			},
		},
	}

	for _, event := range events {
		if err := db.Create(&event).Error; err != nil {
			log.Printf("Warning: failed to seed event '%s': %v", event.Title, err)
		}
	}

	log.Println("Event seeder completed successfully!")
	return nil
}

func SeedMerchandise(db *gorm.DB) error {
	var count int64
	db.Model(&models.Merchandise{}).Count(&count)
	if count > 0 {
		log.Println("Info: merchandise seeder skipped, data already exists")
		return nil
	}

	imgTee := "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800"
	imgHoodie := "https://images.unsplash.com/photo-1556821840-3a63f15732ce?auto=format&fit=crop&q=80&w=800"
	imgTote := "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&q=80&w=800"
	imgCap := "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=800"
	imgWristband := "https://images.unsplash.com/photo-1528566516386-4b8f405cbc6b?auto=format&fit=crop&q=80&w=800"
	imgPoster := "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=800"

	merchandise := []models.Merchandise{
		{
			Name:         "Connected Oversize Tee",
			Slug:         "connected-oversize-tee",
			Description:  "Kaos oversize premium dengan print logo Connected 2026 di dada kiri dan full-print artwork di bagian belakang. Bahan 100% Cotton Combed 30s, adem dan nyaman sepanjang hari. Tersedia dalam warna hitam dan putih.",
			Price:        180000,
			Stock:        150,
			ImageURL:     &imgTee,
			ActiveStatus: true,
		},
		{
			Name:         "Connected Hoodie",
			Slug:         "connected-hoodie",
			Description:  "Hoodie tebal berkualitas dengan desain eksklusif Connected 2026. Cocok untuk kamu yang mau tampil kece setelah festival. Bahan fleece premium anti-pilling, ada kantong depan dan hoodie adjustable. Limited edition!",
			Price:        385000,
			Stock:        80,
			ImageURL:     &imgHoodie,
			ActiveStatus: true,
		},
		{
			Name:         "Connected Tote Bag",
			Slug:         "connected-tote-bag",
			Description:  "Tote bag canvas tebal dengan artwork eksklusif Connected 2026. Kapasitas besar, cocok buat bawa barang bawaan festival kamu. Bahan canvas 12oz yang kuat dan tahan lama. Print screen printing dengan tinta water-based yang ramah lingkungan.",
			Price:        95000,
			Stock:        200,
			ImageURL:     &imgTote,
			ActiveStatus: true,
		},
		{
			Name:         "Connected Snapback Cap",
			Slug:         "connected-snapback-cap",
			Description:  "Topi snapback eksklusif dengan embroidery logo Connected. Bahan twill yang kuat dengan sistem snapback adjustable yang nyaman di semua ukuran kepala. Warna hitam dengan aksen salmon sesuai brand Connected.",
			Price:        145000,
			Stock:        100,
			ImageURL:     &imgCap,
			ActiveStatus: true,
		},
		{
			Name:         "Connected Festival Wristband",
			Slug:         "connected-festival-wristband",
			Description:  "Wristband eksklusif Connected 2026 edisi koleksi. Bahan silicone premium dengan print logo Connected berwarna. Bawa pulang kenangan dari Connected sebagai aksesoris kebanggaanmu. Pack of 3 wristbands.",
			Price:        55000,
			Stock:        300,
			ImageURL:     &imgWristband,
			ActiveStatus: true,
		},
		{
			Name:         "Connected Poster A2",
			Slug:         "connected-poster-a2",
			Description:  "Poster resmi Connected 2026 ukuran A2 (42x59cm) dengan artwork eksklusif. Print menggunakan teknik high-quality offset printing dengan finishing glossy. Kolektor item yang wajib kamu punya! Datang dengan tube packaging agar aman.",
			Price:        75000,
			Stock:        120,
			ImageURL:     &imgPoster,
			ActiveStatus: true,
		},
	}

	for _, merch := range merchandise {
		if err := db.Create(&merch).Error; err != nil {
			log.Printf("Warning: failed to seed merchandise '%s': %v", merch.Name, err)
		}
	}

	log.Println("Merchandise seeder completed successfully!")
	return nil
}
