package main

import (
	"log"
	"os"
	"time"

	"reflect"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/go-playground/validator/v10"
	"github.com/joho/godotenv"
	"mastutik-api/config"
	"mastutik-api/controllers"
	"mastutik-api/middlewares"
	"mastutik-api/repositories"
	"mastutik-api/services"
	"mastutik-api/pkg/seeder"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("Info: .env file not found, using system environment variables")
	}

	// Gunakan nama JSON untuk pesan error validator
	if v, ok := binding.Validator.Engine().(*validator.Validate); ok {
		v.RegisterTagNameFunc(func(fld reflect.StructField) string {
			name := strings.SplitN(fld.Tag.Get("json"), ",", 2)[0]
			if name == "-" {
				return ""
			}
			return name
		})
	}

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
	// Set mode production jika bukan di lokal agar log tidak terlalu berat
	if os.Getenv("APP_ENV") == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.Default()

	// Gunakan middleware yang sudah dipindah
	r.Use(middlewares.CORSMiddleware())
	r.Static("/uploads", "./uploads")

	// 5. API ENDPOINTS V1
	api := r.Group("/api/v1")
	{
		// ... (isi routes kamu tetap sama seperti sebelumnya)
		authGroup := api.Group("/auth")
		authGroup.Use(middlewares.NewSimpleRateLimit(10, time.Minute))
		{
			authGroup.POST("/register", authHandler.Register)
			authGroup.POST("/login", authHandler.Login)
			authGroup.POST("/google", authHandler.GoogleLogin)
		}

		usersGroup := api.Group("/users")
		usersGroup.Use(middlewares.RequireAuth())
		{
			usersGroup.GET("/me", authHandler.GetMe)
			usersGroup.PUT("/me", authHandler.UpdateMe)
		}

		eventsGroup := api.Group("/events")
		{
			eventsGroup.GET("", eventHandler.GetPublishedEvents)
			eventsGroup.GET("/", eventHandler.GetPublishedEvents)
			eventsGroup.GET("/:id", eventHandler.GetPublishedEventByID)
		}

		merchandiseGroup := api.Group("/merchandise")
		{
			merchandiseGroup.GET("", merchHandler.GetPublicMerchandise)
			merchandiseGroup.GET("/:id", merchHandler.GetPublicMerchandiseByID)
		}

		ordersGroup := api.Group("/orders")
		ordersGroup.Use(middlewares.RequireAuth())
		{
			ordersGroup.POST("", orderHandler.CreateOrder)
			ordersGroup.GET("/me", orderHandler.GetMyOrders)
			ordersGroup.GET("/:id", orderHandler.GetOrderByID)
		}

		webhookGroup := api.Group("/webhooks")
		{
			webhookGroup.POST("/xendit", webhookHandler.XenditCallback)
		}

		adminGroup := api.Group("/admin")
		{
			adminAuthGroup := adminGroup.Group("/auth")
			adminAuthGroup.Use(middlewares.NewSimpleRateLimit(10, time.Minute))
			{
				adminAuthGroup.POST("/login", authHandler.AdminLogin)
			}

			adminProtected := adminGroup.Group("/")
			adminProtected.Use(middlewares.RequireAuth(), middlewares.RequireRole("admin"))
			{
				adminProtected.GET("/events", eventHandler.GetAllEventsAdmin)
				adminProtected.GET("/events/:id", eventHandler.GetEventByIDAdmin)
				adminProtected.POST("/events", eventHandler.CreateEvent)
				adminProtected.PUT("/events/:id", eventHandler.UpdateEvent)
				adminProtected.DELETE("/events/:id", eventHandler.DeleteEvent)
				adminProtected.POST("/events/:id/tickets", eventHandler.CreateTicket)
				adminProtected.PUT("/tickets/:ticket_id", eventHandler.UpdateTicketStatus)
				adminProtected.DELETE("/tickets/:ticket_id", eventHandler.DeleteTicket)
				adminProtected.GET("/merchandise", merchHandler.GetAllMerchandiseAdmin)
				adminProtected.GET("/merchandise/:id", merchHandler.GetMerchandiseByIDAdmin)
				adminProtected.POST("/merchandise", merchHandler.CreateMerchandise)
				adminProtected.PUT("/merchandise/:id", merchHandler.UpdateMerchandise)
				adminProtected.DELETE("/merchandise/:id", merchHandler.DeleteMerchandise)
				adminProtected.GET("/dashboard/summary", dashboardHandler.GetSummary)
				adminProtected.GET("/dashboard/sales-chart", dashboardHandler.GetSalesChart)
				adminProtected.GET("/orders", orderHandler.GetAllOrdersAdmin)
				adminProtected.GET("/orders/:id", orderHandler.GetOrderByIDAdmin)
				adminProtected.PATCH("/orders/:id/check-in", orderHandler.CheckInOrderAdmin)
			}
		}
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server running at http://localhost:%s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("failed to run server: %v", err)
	}
}
