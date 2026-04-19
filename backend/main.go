package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"flag"
	"github.com/gin-contrib/gzip"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"mastutik-api/config"
	"mastutik-api/controllers"
	"mastutik-api/middlewares"
	"mastutik-api/pkg/seeder"
	"mastutik-api/repositories"
	"mastutik-api/routes"
	"mastutik-api/services"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("Info: .env file not found, using system environment variables")
	}

	// 0. HEALTHCHECK CLI & GIN MODE
	healthCheck := flag.Bool("health", false, "Run health check")
	flag.Parse()

	isHealthCheck := *healthCheck || (len(os.Args) > 1 && os.Args[1] == "health")

	if isHealthCheck {
		resp, err := http.Get("http://localhost:8080/health")
		if err != nil || resp.StatusCode != 200 {
			os.Exit(1)
		}
		os.Exit(0)
	}

	// MANDATORY CONFIG CHECK (Fail fast if missing)
	if os.Getenv("JWT_SECRET") == "" {
		log.Fatal("JWT_SECRET environment variable is REQUIRED but not found. Server stopped.")
	}

	gin.SetMode(gin.ReleaseMode)

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
	sqlDB.SetMaxIdleConns(5)  // Koneksi standby sedikit saja
	sqlDB.SetMaxOpenConns(10) // Batasi maksimal koneksi agar tidak OOM
	sqlDB.SetConnMaxLifetime(5 * time.Minute)

	if err := seeder.SeedAdmin(config.DB); err != nil {
		log.Printf("Warning: failed to seed database: %v", err)
	}

	// 3. DEPENDENCY INJECTION
	userRepo := repositories.NewUserRepository(config.DB)
	eventRepo := repositories.NewEventRepository(config.DB)
	merchRepo := repositories.NewMerchandiseRepository(config.DB)
	orderRepo := repositories.NewOrderRepository(config.DB)
	taxRepo := repositories.NewTaxRepository(config.DB)

	authService := services.NewAuthService(userRepo)
	eventService := services.NewEventService(eventRepo)
	merchService := services.NewMerchandiseService(merchRepo)
	xenditService := services.NewXenditService()
	taxService := services.NewTaxService(taxRepo)
	orderService := services.NewOrderService(orderRepo, eventRepo, merchRepo, userRepo, xenditService, taxRepo)
	dashboardService := services.NewDashboardService(orderRepo, eventRepo, merchRepo)

	authHandler := controllers.NewAuthHandler(authService, userRepo)
	eventHandler := controllers.NewEventHandler(eventService)
	merchHandler := controllers.NewMerchandiseHandler(merchService)
	orderHandler := controllers.NewOrderHandler(orderService)
	webhookHandler := controllers.NewWebhookHandler(orderService)
	dashboardHandler := controllers.NewDashboardHandler(dashboardService)
	taxHandler := controllers.NewTaxHandler(taxService)


	// 4. ROUTER SETUP
	r := gin.New()
	r.Use(middlewares.CustomPanicHandler()) // Custom panic handler
	r.Use(gin.Recovery())                   // Fallback
	r.Use(middlewares.GlobalErrorHandler()) // Wrap everything in a standard error handler
	r.Use(gin.Logger())
	r.Use(middlewares.RequestTimeoutMiddleware())
	r.Use(gzip.Gzip(gzip.DefaultCompression))
	r.Use(middlewares.CORSMiddleware())

	// 🔥 HEALTHCHECK ENDPOINT
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// 5. CALL ROUTE SETUP
	routes.SetupRoutes(
		r,
		authHandler,
		eventHandler,
		merchHandler,
		orderHandler,
		webhookHandler,
		dashboardHandler,
		taxHandler,
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
