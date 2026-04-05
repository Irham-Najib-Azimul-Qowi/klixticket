package dto

import "time"

type DashboardSummaryResponse struct {
	Revenue      float64 `json:"revenue"`
	TicketsSold  int64   `json:"tickets_sold"`
	ActiveEvents int64   `json:"active_events"`
}

type SalesChartPoint struct {
	Date    string  `json:"date"`
	Label   string  `json:"label"`
	Revenue float64 `json:"revenue"`
}

type XenditWebhookRequest struct {
	ID         string `json:"id" binding:"required"`
	ExternalID string `json:"external_id" binding:"required"`
	Status     string `json:"status" binding:"required"`
}

type SalesAggregate struct {
	Date    time.Time
	Revenue float64
}
