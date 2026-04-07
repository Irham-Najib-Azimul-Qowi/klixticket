package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"mastutik-api/config"
	"mastutik-api/controllers"
	"mastutik-api/middlewares"
	"mastutik-api/repositories"
	"mastutik-api/services"
	"mastutik-api/pkg/seeder"
	"mastutik-api/routes"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("Info: .env file not found, using system environment variables")
	}

	// 1. SETUP VALIDATOR & CONFIG
	config.SetupValidator()

	// 2. KONEKSI DB & OPTIMASI POOLING
	config.ConnectDB()
	sqlDB, err := config.DB.DB()
	if err != nil {
		log.Fatalf("failed to get sql.DB: %v", err)
	}

	// Setting untuk VPS RAM 1GB
	sqlDB.SetMaxIdleConns(5)    // Koneksi standby sedikit saja
	sqlDB.SetMaxOpenConns(20)   // Batasi maksimal koneksi agar tidak OOM
	sqlDB.SetConnMaxLifetime(0) // Atur sesuai kebutuhan

	if err := seeder.SeedAdmin(config.DB); err != nil {
		log.Fatalf("failed to seed admin user: %v", err)
	}

	// 3. DEPENDENCY INJECTION
	userRepo := repositories.NewUserRepository(config.DB)
	eventRepo := repositories.NewEventRepository(config.DB)
	merchRepo := repositories.NewMerchandiseRepository(config.DB)
	orderRepo := repositories.NewOrderRepository(config.DB)

	authService := services.NewAuthService(userRepo)
	eventService := services.NewEventService(eventRepo)
	merchService := services.NewMerchandiseService(merchRepo)
	xenditService := services.NewXenditService()
	orderService := services.NewOrderService(orderRepo, eventRepo, merchRepo, userRepo, xenditService)
	dashboardService := services.NewDashboardService(orderRepo, eventRepo)

	authHandler := controllers.NewAuthHandler(authService, userRepo)
	eventHandler := controllers.NewEventHandler(eventService)
	merchHandler := controllers.NewMerchandiseHandler(merchService)
	orderHandler := controllers.NewOrderHandler(orderService)
	webhookHandler := controllers.NewWebhookHandler(orderService)
	dashboardHandler := controllers.NewDashboardHandler(dashboardService)

	// 4. ROUTER SETUP
	if os.Getenv("APP_ENV") == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.Default()
	r.Use(middlewares.CORSMiddleware())

	// 5. CALL ROUTE SETUP
	routes.SetupRoutes(
		r,
		authHandler,
		eventHandler,
		merchHandler,
		orderHandler,
		webhookHandler,
		dashboardHandler,
	)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server running at http://localhost:%s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("failed to run server: %v", err)
	}
}
