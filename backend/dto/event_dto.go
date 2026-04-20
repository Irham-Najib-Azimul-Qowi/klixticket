package dto

import "time"

type EventListQuery struct {
	Limit         int    `form:"limit" binding:"omitempty,min=1,max=100"`
	Offset        int    `form:"offset" binding:"omitempty,min=0"`
	PublishStatus string `form:"publish_status" binding:"omitempty,oneof=draft published"`
	ActiveOnly    *bool  `form:"active_only"`
}

type CreateEventRequest struct {
	Title         string                `json:"title" binding:"required,min=3"`
	Description   string                `json:"description"`
	Location      string                `json:"location" binding:"required,min=3"`
	StartDate     time.Time             `json:"start_date" binding:"required"`
	EndDate       time.Time             `json:"end_date" binding:"required"`
	BannerURL     *string               `json:"banner_url"`
	PublishStatus string                `json:"publish_status" binding:"required,oneof=draft published"`
	TicketTypes   []CreateTicketRequest `json:"ticket_types" binding:"required,min=1,dive"`
	Lineup        []LineupItemRequest   `json:"lineup" binding:"dive"`
}

type UpdateEventRequest struct {
	Title         string                 `json:"title" binding:"required,min=3"`
	Description   string                 `json:"description"`
	Location      string                 `json:"location" binding:"required,min=3"`
	StartDate     time.Time              `json:"start_date" binding:"required"`
	EndDate       time.Time              `json:"end_date" binding:"required"`
	BannerURL     *string                `json:"banner_url"`
	PublishStatus string                 `json:"publish_status" binding:"required,oneof=draft published"`
	TicketTypes   *[]UpsertTicketRequest `json:"ticket_types"`
	Lineup        *[]UpsertLineupRequest `json:"lineup"`
}

type CreateTicketRequest struct {
	Name         string    `json:"name" binding:"required,min=2"`
	Description  string    `json:"description"`
	Price        float64   `json:"price" binding:"required,gt=0"`
	Quota        *int      `json:"quota" binding:"required,gte=0"`
	SalesStartAt time.Time `json:"sales_start_at" binding:"required"`
	SalesEndAt   time.Time `json:"sales_end_at" binding:"required"`
	ActiveStatus *bool     `json:"active_status"`
}

type UpdateTicketRequest struct {
	ActiveStatus *bool `json:"active_status" binding:"required"`
}

type UpsertTicketRequest struct {
	ID           uint      `json:"id"`
	Name         string    `json:"name" binding:"required,min=2"`
	Description  string    `json:"description"`
	Price        float64   `json:"price" binding:"required,gt=0"`
	Quota        *int      `json:"quota" binding:"required,gte=0"`
	SalesStartAt time.Time `json:"sales_start_at" binding:"required"`
	SalesEndAt   time.Time `json:"sales_end_at" binding:"required"`
	ActiveStatus *bool     `json:"active_status"`
}

type LineupItemRequest struct {
	Name     string  `json:"name" binding:"required"`
	ImageURL *string `json:"image_url"`
}

type UpsertLineupRequest struct {
	ID       uint    `json:"id"`
	Name     string  `json:"name" binding:"required"`
	ImageURL *string `json:"image_url"`
}
