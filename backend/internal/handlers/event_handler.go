package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"mastutik-api/pkg/utils"
)

func GetEventsPlaceholder(c *gin.Context) {
	// Dummy data untuk frontend MVP
	events := []map[string]interface{}{
		{
			"id":          1,
			"title":       "Maulid Nabi & Tabligh Akbar",
			"description": "Acara peringatan Maulid Nabi bersama ulama besar.",
			"location":    "Masjid Istiqlal, Jakarta",
			"date":        "2026-05-15T18:00:00Z",
			"price":       "Gratis",
			"banner_url":  "http://localhost:8080/uploads/images/dummy-event-1.png",
		},
		{
			"id":          2,
			"title":       "Tech Startup Expo 2026",
			"description": "Pameran startup teknologi terbesar di Indonesia. Bangun networking Anda.",
			"location":    "Jakarta Convention Center",
			"date":        "2026-06-20T09:00:00Z",
			"price":       "Rp 50.000",
			"banner_url":  "http://localhost:8080/uploads/images/dummy-event-2.png",
		},
	}

	utils.SuccessResponse(c, http.StatusOK, "Events fetched successfully", events)
}
