package routes

import (
	"time"

	"github.com/gin-gonic/gin"
	"mastutik-api/controllers"
	"mastutik-api/middlewares"
)

func SetupRoutes(
	r *gin.Engine,
	authHandler *controllers.AuthHandler,
	eventHandler *controllers.EventHandler,
	merchHandler *controllers.MerchandiseHandler,
	orderHandler *controllers.OrderHandler,
	webhookHandler *controllers.WebhookHandler,
	dashboardHandler *controllers.DashboardHandler,
	taxHandler *controllers.TaxHandler,
) {
	// Root and static
	r.Static("/uploads", "./uploads")

	// API ENDPOINTS V1
	api := r.Group("/api/v1")
	{
		// Auth Routes
		authGroup := api.Group("/auth")
		authGroup.Use(middlewares.NewSimpleRateLimit(10, time.Minute))
		{
			authGroup.POST("/register", authHandler.Register)
			authGroup.POST("/login", authHandler.Login)
			authGroup.POST("/google", authHandler.GoogleLogin)
			authGroup.POST("/forgot-password", authHandler.ForgotPassword)
			authGroup.POST("/reset-password", authHandler.ResetPassword)
		}

		// User Routes
		usersGroup := api.Group("/users")
		usersGroup.Use(middlewares.RequireAuth())
		{
			usersGroup.GET("/me", authHandler.GetMe)
			usersGroup.PUT("/me", authHandler.UpdateMe)
			usersGroup.POST("/me/change-password", authHandler.ChangePassword)
		}

		// Event Routes (Public)
		eventsGroup := api.Group("/events")
		{
			eventsGroup.GET("", eventHandler.GetPublishedEvents)
			eventsGroup.GET("/nearest", eventHandler.GetNearestEvent)
			eventsGroup.GET("/:id", eventHandler.GetPublishedEventByID)
		}

		// Merchandise Routes (Public)
		merchandiseGroup := api.Group("/merchandise")
		{
			merchandiseGroup.GET("", merchHandler.GetPublicMerchandise)
			merchandiseGroup.GET("/:id", merchHandler.GetPublicMerchandiseByID)
		}

		// Tax Routes (Public)
		taxesGroup := api.Group("/taxes")
		{
			taxesGroup.GET("", taxHandler.GetActiveTaxes)
		}


		ordersGroup := api.Group("/orders")
		ordersGroup.Use(middlewares.RequireAuth())
		{
			// Prevent double orders via spamming from the same IP (1 request per 12s on average)
			ordersGroup.POST("", middlewares.NewSimpleRateLimit(5, time.Minute), orderHandler.CreateOrder)
			ordersGroup.GET("/my", orderHandler.GetMyOrders) // Changed from /me to /my
			ordersGroup.GET("/items", orderHandler.GetMyItems)
			ordersGroup.GET("/:id", orderHandler.GetOrderByID)
			ordersGroup.GET("/:id/resume", orderHandler.ResumeOrder)
		}

		// Webhook Routes
		webhookGroup := api.Group("/webhooks")
		{
			webhookGroup.POST("/xendit", webhookHandler.XenditCallback)
		}

		// Admin Routes
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
				// Admin Event Management
				adminProtected.GET("/events", eventHandler.GetAllEventsAdmin)
				adminProtected.GET("/events/:id", eventHandler.GetEventByIDAdmin)
				adminProtected.POST("/events", eventHandler.CreateEvent)
				adminProtected.PUT("/events/:id", eventHandler.UpdateEvent)
				adminProtected.DELETE("/events/:id", eventHandler.DeleteEvent)
				adminProtected.POST("/events/:id/tickets", eventHandler.CreateTicket)
				adminProtected.PUT("/tickets/:ticket_id", eventHandler.UpdateTicketStatus)
				adminProtected.DELETE("/tickets/:ticket_id", eventHandler.DeleteTicket)

				// Admin Merchandise Management
				adminProtected.GET("/merchandise", merchHandler.GetAllMerchandiseAdmin)
				adminProtected.GET("/merchandise/:id", merchHandler.GetMerchandiseByIDAdmin)
				adminProtected.POST("/merchandise", merchHandler.CreateMerchandise)
				adminProtected.PUT("/merchandise/:id", merchHandler.UpdateMerchandise)
				adminProtected.DELETE("/merchandise/:id", merchHandler.DeleteMerchandise)

				// Admin Dashboard
				adminProtected.GET("/dashboard/summary", dashboardHandler.GetSummary)
				adminProtected.GET("/dashboard/sales-chart", dashboardHandler.GetSalesChart)

				// Admin Order Management
				adminProtected.GET("/orders", orderHandler.GetAllOrdersAdmin)
				adminProtected.GET("/orders/:id", orderHandler.GetOrderByIDAdmin)
				adminProtected.PATCH("/orders/:id/check-in", orderHandler.CheckInOrderAdmin)
				adminProtected.POST("/scan", orderHandler.ScanItemAdmin)

				// Admin Tax Management
				adminProtected.GET("/taxes", taxHandler.GetAllTaxes)
				adminProtected.POST("/taxes", taxHandler.CreateTax)
				adminProtected.PUT("/taxes/:id", taxHandler.UpdateTax)
				adminProtected.DELETE("/taxes/:id", taxHandler.DeleteTax)
			}

		}
	}
}
