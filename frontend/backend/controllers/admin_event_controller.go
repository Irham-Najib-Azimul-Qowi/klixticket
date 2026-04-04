package controllers

import (
	"net/http"

	"mastutik-api/config"
	"mastutik-api/models"

	"github.com/gin-gonic/gin"
)

func CreateEvent(c *gin.Context) {
	var input models.Event

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := config.DB.Create(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create event"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": input})
}

func GetEvents(c *gin.Context) {
	var events []models.Event

	if err := config.DB.Find(&events).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch events"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": events})
}
