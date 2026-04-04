package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"mastutik-api/config"
	"mastutik-api/internal/handlers"
)

// CORSMiddleware digunakan untuk mengizinkan permintaan dari origin frontend
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*") // Ganti dengan origin frontend jika mau lebih aman
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

func main() {
	// Koneksi ke Database (sudah ada di config/database.go)
	config.ConnectDB()

	r := gin.Default()

	// Pasang Middleware CORS
	r.Use(CORSMiddleware())

	// Rute statis untuk melayani gambar /uploads/images
	r.Static("/uploads", "./uploads")

	// Group route API v1
	api := r.Group("/api")
	{
		// /api/events -> sementara diarahkan ke handler Dummy
		api.GET("/events", handlers.GetEventsPlaceholder)

		// Nanti rute event lainnya bisa ditambahkan di sini, contoh:
		// api.GET("/events/:id", handlers.GetEventDetail)
	}

	// Group Admin placeholder
	admin := api.Group("/v1/admin")
	{
		_ = admin // bypass unused error for now
		// admin routes
	}

	// Jalankan server di port 8080 agar sama dengan URL frontend
	log.Println("Server running at http://localhost:8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("failed to run server: %v", err)
	}
}