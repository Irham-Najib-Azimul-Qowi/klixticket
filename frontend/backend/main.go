package main

import (
	"log"

	"mastutik-api/config"
	"mastutik-api/models"
	"mastutik-api/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	// Connect to Database
	config.ConnectDB()

	// Auto-migrate tables
	log.Println("Migrating database models...")
	err := config.DB.AutoMigrate(&models.Event{})
	if err != nil {
		log.Printf("Warning: Failed to migrate database: %v", err)
	}

	// Initialize Router
	r := gin.Default()

	// Setup Routes
	routes.SetupRoutes(r)

	// Start Server
	log.Println("Server is running on port 8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatal("Failed to start server: ", err)
	}
}
