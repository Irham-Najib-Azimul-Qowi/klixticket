package main

import (
	"fmt"
	"log"
	"time"

	"mastutik-api/config"
	"mastutik-api/models"
)

func main() {
	config.ConnectDB()

	// 1. Create or Find an Event
	var event models.Event
	err := config.DB.Where("slug = ?", "connected-festival-madiun").First(&event).Error
	if err != nil {
		event = models.Event{
			Title:         "Connected Festival Madiun",
			Slug:          "connected-festival-madiun",
			Description:   "Festival musik terbesar di Kota Pendekar Madiun.",
			Location:      "Lapangan Kodim, Madiun",
			StartDate:     time.Now().Add(30 * 24 * time.Hour),
			EndDate:       time.Now().Add(33 * 24 * time.Hour),
			PublishStatus: "published",
		}
		if err := config.DB.Create(&event).Error; err != nil {
			log.Fatalf("Failed to create event: %v", err)
		}
	}

	// 2. Prepare mock tickets
	tickets := []models.TicketType{
		{
			ID:             1,
			EventID:        event.ID,
			Name:           "Presale 1",
			Description:    "Tiket Terusan 3 Hari - Early Bird",
			Price:          350000,
			Quota:          1000,
			RemainingQuota: 1000,
			SalesStartAt:   time.Now().Add(-24 * time.Hour),
			SalesEndAt:     time.Now().Add(5 * 24 * time.Hour),
			ActiveStatus:   true,
		},
		{
			ID:             2,
			EventID:        event.ID,
			Name:           "Presale 2",
			Description:    "Tiket Terusan 3 Hari - Normal",
			Price:          550000,
			Quota:          5000,
			RemainingQuota: 5000,
			SalesStartAt:   time.Now().Add(-24 * time.Hour),
			SalesEndAt:     time.Now().Add(25 * 24 * time.Hour),
			ActiveStatus:   true,
		},
	}

	for _, t := range tickets {
		var existing models.TicketType
		if err := config.DB.Where("id = ?", t.ID).First(&existing).Error; err != nil {
			if err := config.DB.Save(&t).Error; err != nil {
				log.Printf("Failed to create ticket %s: %v", t.Name, err)
			} else {
				fmt.Printf("Successfully created ticket ID %d - %s\n", t.ID, t.Name)
			}
		} else {
			fmt.Printf("Ticket ID %d - %s already exists. Updating price...\n", existing.ID, existing.Name)
			existing.Price = t.Price
			existing.ActiveStatus = true
			if err := config.DB.Save(&existing).Error; err != nil {
				log.Printf("Failed to update ticket: %v", err)
			}
		}
	}

	fmt.Println("Seeding complete.")
}
