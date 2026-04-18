package config

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"mastutik-api/models"
)

var DB *gorm.DB

func ConnectDB() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: Error loading .env file, relying on system env vars")
	}

	host := os.Getenv("DB_HOST")
	if host == "" {
		host = "localhost" // default fallback
	}
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")
	port := os.Getenv("DB_PORT")
	if port == "" {
		port = "5432"
	}

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Jakarta",
		host, user, password, dbname, port)

	database, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to postgres database:", err)
	}

	fmt.Println("Database connection established successfully")

	// Eksekusi Auto-Migration Schema Database
	err = database.AutoMigrate(
		&models.User{},
		&models.OAuthAccount{},
		&models.Event{},
		&models.TicketType{},
		&models.Merchandise{},
		&models.Order{},
		&models.OrderItem{},
		&models.Payment{},
		&models.PaymentWebhookLog{},
		&models.RedeemableItem{},
	)
	if err != nil {
		log.Fatal("Failed to auto-migrate database schema:", err)
	}

	// Fix check constraints for Sold Out state (quota >= 0)
	// GORM AutoMigrate doesn't update existing check constraints, so we force it.
	database.Exec("ALTER TABLE ticket_types DROP CONSTRAINT IF EXISTS chk_ticket_types_quota")
	database.Exec("ALTER TABLE ticket_types ADD CONSTRAINT chk_ticket_types_quota CHECK (quota >= 0)")
	database.Exec("ALTER TABLE ticket_types DROP CONSTRAINT IF EXISTS chk_ticket_types_remaining_quota")
	database.Exec("ALTER TABLE ticket_types ADD CONSTRAINT chk_ticket_types_remaining_quota CHECK (remaining_quota >= 0)")

	// 🔥 NEW: Security constraints for Orders & Merch
	database.Exec("ALTER TABLE order_items DROP CONSTRAINT IF EXISTS positive_quantity")
	database.Exec("ALTER TABLE order_items ADD CONSTRAINT positive_quantity CHECK (quantity > 0)")
	database.Exec("ALTER TABLE orders DROP CONSTRAINT IF EXISTS positive_amount")
	database.Exec("ALTER TABLE orders ADD CONSTRAINT positive_amount CHECK (total_amount > 0)")

	// 🛡️ Ensure UUID is filled for existing users (Data Migration)
	database.Exec("UPDATE users SET uuid = gen_random_uuid() WHERE uuid IS NULL OR uuid = '00000000-0000-0000-0000-000000000000'")

	fmt.Println("Database migration & security hardening completed successfully!")

	DB = database
}
