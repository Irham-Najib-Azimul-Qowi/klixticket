package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

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

	// MANDATORY CONFIG CHECK (Fail fast if missing)
	if os.Getenv("JWT_SECRET") == "" {
		log.Fatal("JWT_SECRET environment variable is REQUIRED but not found. Server stopped.")
	}

	// 1. SETUP VALIDATOR & CONFIG
	config.SetupValidator()

	// 2. KONEKSI DB & OPTIMASI POOLING
	config.ConnectDB()
	
	// 🧹 HOTFIX: Zero out identical empty idempotency keys to prevent Postgres UNIQUE constraint violation during updates
	config.DB.Exec("UPDATE orders SET idempotency_key = NULL WHERE idempotency_key = ''")
	
	sqlDB, err := config.DB.DB()
	if err != nil {
		log.Fatalf("failed to get sql.DB: %v", err)
	}

	// Setting untuk VPS RAM 1GB
	sqlDB.SetMaxIdleConns(5)    // Koneksi standby sedikit saja
	sqlDB.SetMaxOpenConns(20)   // Batasi maksimal koneksi agar tidak OOM
	sqlDB.SetConnMaxLifetime(1 * time.Hour)

	if err := seeder.SeedAdmin(config.DB); err != nil {
		log.Printf("Warning: failed to seed database: %v", err)
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
	dashboardService := services.NewDashboardService(orderRepo, eventRepo, merchRepo)

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

	r := gin.New() // Use gin.New() for cleaner control
	r.Use(middlewares.GlobalErrorHandler()) // Wrap everything in a standard error handler
	r.Use(gin.Logger())
	r.Use(gin.Recovery())
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

	// 6. INITIALIZE HTTP SERVER
	srv := &http.Server{
		Addr:    ":" + port,
		Handler: r,
		// Performance timeout settings for VPS 1GB RAM
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      30 * time.Second,
		IdleTimeout:       120 * time.Second,
	}

	// 7. GRACEFUL SHUTDOWN LOGIC
	go func() {
		log.Printf("Server running at http://localhost:%s", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %v", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	// context with timeout to shutdown (5s)
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown:", err)
	}

	// Close database connection
	if db, err := config.DB.DB(); err == nil {
		db.Close()
		log.Println("Database connection closed.")
	}

	log.Println("Server exiting successfully")
}
