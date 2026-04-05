package services

import (
	"context"
	"time"

	"mastutik-api/internal/dto"
	"mastutik-api/internal/repository"
)

type DashboardService interface {
	GetSummary(ctx context.Context) (*dto.DashboardSummaryResponse, error)
	GetSalesChart(ctx context.Context) ([]dto.SalesChartPoint, error)
}

type dashboardService struct {
	orderRepo repository.OrderRepository
	eventRepo repository.EventRepository
}

func NewDashboardService(orderRepo repository.OrderRepository, eventRepo repository.EventRepository) DashboardService {
	return &dashboardService{
		orderRepo: orderRepo,
		eventRepo: eventRepo,
	}
}

func (s *dashboardService) GetSummary(ctx context.Context) (*dto.DashboardSummaryResponse, error) {
	ctx, cancel := withOrderTimeout(ctx)
	defer cancel()

	revenue, err := s.orderRepo.GetPaidRevenueSummary(ctx)
	if err != nil {
		return nil, err
	}

	ticketsSold, err := s.orderRepo.GetPaidTicketsSoldSummary(ctx)
	if err != nil {
		return nil, err
	}

	activeEvents, err := s.eventRepo.CountActivePublished(ctx, time.Now())
	if err != nil {
		return nil, err
	}

	return &dto.DashboardSummaryResponse{
		Revenue:      revenue,
		TicketsSold:  ticketsSold,
		ActiveEvents: activeEvents,
	}, nil
}

func (s *dashboardService) GetSalesChart(ctx context.Context) ([]dto.SalesChartPoint, error) {
	ctx, cancel := withOrderTimeout(ctx)
	defer cancel()

	now := time.Now()
	endDate := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	startDate := endDate.AddDate(0, 0, -6)

	aggregates, err := s.orderRepo.GetDailyPaidSales(ctx, startDate, endDate)
	if err != nil {
		return nil, err
	}

	revenueByDate := make(map[string]float64, len(aggregates))
	for _, aggregate := range aggregates {
		revenueByDate[aggregate.Date.Format("2006-01-02")] = aggregate.Revenue
	}

	chart := make([]dto.SalesChartPoint, 0, 7)
	for day := 0; day < 7; day++ {
		current := startDate.AddDate(0, 0, day)
		key := current.Format("2006-01-02")
		chart = append(chart, dto.SalesChartPoint{
			Date:    key,
			Label:   current.Format("Mon"),
			Revenue: revenueByDate[key],
		})
	}

	return chart, nil
}
