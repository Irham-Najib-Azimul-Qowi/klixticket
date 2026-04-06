package services

import (
	"context"
	"errors"
	"fmt"
	"regexp"
	"strings"
	"time"

	"gorm.io/gorm"

	"mastutik-api/dto"
	"mastutik-api/models"
	"mastutik-api/repositories"
	"mastutik-api/pkg/utils"
)

var (
	ErrEventNotFound                = errors.New("event not found")
	ErrTicketTypeNotFound           = errors.New("ticket type not found")
	ErrTicketNotInEvent             = errors.New("ticket does not belong to this event")
	ErrInvalidEventDateRange        = errors.New("event end date must be after start date")
	ErrInvalidTicketSalesRange      = errors.New("ticket sales end date must be after sales start date")
	ErrTicketSalesExceedsEvent      = errors.New("ticket sales end date must be on or before event end date")
	ErrTicketSalesStartsAfterEvent  = errors.New("ticket sales start date must be before event end date")
	ErrDuplicateTicketName          = errors.New("ticket names must be unique within the same event")
	ErrDuplicateTicketID            = errors.New("ticket IDs must be unique within the same request")
	ErrEventEndBeforeExistingTicket = errors.New("event end date cannot be earlier than an existing ticket sales end date")
	ErrTicketQuotaBelowSold         = errors.New("ticket quota cannot be lower than sold quantity")
	ErrCannotDeleteSoldTicket       = errors.New("ticket type cannot be deleted because it already has sold quantity")
)

const eventDBTimeout = 5 * time.Second

var nonSlugCharacterPattern = regexp.MustCompile(`[^a-z0-9-]+`)

type EventService interface {
	// Public
	GetPublishedEvents(ctx context.Context, query dto.EventListQuery) ([]models.Event, error)
	GetPublishedEventByID(ctx context.Context, id uint) (*models.Event, error)

	// Admin
	GetAllEvents(ctx context.Context, query dto.EventListQuery) ([]models.Event, error)
	GetEventByID(ctx context.Context, id uint) (*models.Event, error)
	CreateEvent(ctx context.Context, req dto.CreateEventRequest) (*models.Event, error)
	UpdateEvent(ctx context.Context, id uint, req dto.UpdateEventRequest) (*models.Event, error)
	DeleteEvent(ctx context.Context, id uint) error

	// Ticket Admin
	CreateTicket(ctx context.Context, eventID uint, req dto.CreateTicketRequest) (*models.TicketType, error)
	UpdateTicketStatus(ctx context.Context, ticketID uint, req dto.UpdateTicketRequest) (*models.TicketType, error)
	DeleteTicket(ctx context.Context, ticketID uint) error
}

type eventService struct {
	repo repositories.EventRepository
}

func NewEventService(repo repositories.EventRepository) EventService {
	return &eventService{repo: repo}
}

func withEventTimeout(ctx context.Context) (context.Context, context.CancelFunc) {
	if ctx == nil {
		ctx = context.Background()
	}

	return context.WithTimeout(ctx, eventDBTimeout)
}

func generateSlug(title string) string {
	slug := strings.ToLower(strings.TrimSpace(title))
	slug = strings.ReplaceAll(slug, " ", "-")
	slug = nonSlugCharacterPattern.ReplaceAllString(slug, "-")
	slug = strings.Trim(slug, "-")
	if slug == "" {
		slug = "event"
	}

	return fmt.Sprintf("%s-%d", slug, time.Now().UnixMilli())
}

func normalizeOptionalString(value *string) *string {
	if value == nil {
		return nil
	}

	trimmed := strings.TrimSpace(*value)
	if trimmed == "" {
		return nil
	}

	return &trimmed
}

func sameOptionalString(a, b *string) bool {
	switch {
	case a == nil && b == nil:
		return true
	case a == nil || b == nil:
		return false
	default:
		return strings.TrimSpace(*a) == strings.TrimSpace(*b)
	}
}

func normalizeEventListQuery(query dto.EventListQuery) dto.EventListQuery {
	if query.Limit <= 0 {
		query.Limit = 10
	}
	if query.Limit > 100 {
		query.Limit = 100
	}
	if query.Offset < 0 {
		query.Offset = 0
	}

	return query
}

func validateEventDateRange(startDate, endDate time.Time) error {
	if !endDate.After(startDate) {
		return ErrInvalidEventDateRange
	}

	return nil
}

func validateTicketRequests(eventEndDate time.Time, tickets []dto.CreateTicketRequest) error {
	seenTicketNames := make(map[string]struct{}, len(tickets))

	for _, ticket := range tickets {
		if !ticket.SalesEndAt.After(ticket.SalesStartAt) {
			return fmt.Errorf("%w: %s", ErrInvalidTicketSalesRange, ticket.Name)
		}

		if !ticket.SalesStartAt.Before(eventEndDate) {
			return fmt.Errorf("%w: %s", ErrTicketSalesStartsAfterEvent, ticket.Name)
		}

		if ticket.SalesEndAt.After(eventEndDate) {
			return fmt.Errorf("%w: %s", ErrTicketSalesExceedsEvent, ticket.Name)
		}

		normalizedName := strings.ToLower(strings.TrimSpace(ticket.Name))
		if _, exists := seenTicketNames[normalizedName]; exists {
			return fmt.Errorf("%w: %s", ErrDuplicateTicketName, ticket.Name)
		}

		seenTicketNames[normalizedName] = struct{}{}
	}

	return nil
}

func validateUpsertTicketRequests(eventEndDate time.Time, tickets []dto.UpsertTicketRequest) error {
	seenTicketNames := make(map[string]struct{}, len(tickets))
	seenTicketIDs := make(map[uint]struct{}, len(tickets))

	for _, ticket := range tickets {
		if !ticket.SalesEndAt.After(ticket.SalesStartAt) {
			return fmt.Errorf("%w: %s", ErrInvalidTicketSalesRange, ticket.Name)
		}

		if !ticket.SalesStartAt.Before(eventEndDate) {
			return fmt.Errorf("%w: %s", ErrTicketSalesStartsAfterEvent, ticket.Name)
		}

		if ticket.SalesEndAt.After(eventEndDate) {
			return fmt.Errorf("%w: %s", ErrTicketSalesExceedsEvent, ticket.Name)
		}

		normalizedName := strings.ToLower(strings.TrimSpace(ticket.Name))
		if _, exists := seenTicketNames[normalizedName]; exists {
			return fmt.Errorf("%w: %s", ErrDuplicateTicketName, ticket.Name)
		}

		seenTicketNames[normalizedName] = struct{}{}

		if ticket.ID == 0 {
			continue
		}

		if _, exists := seenTicketIDs[ticket.ID]; exists {
			return fmt.Errorf("%w: %d", ErrDuplicateTicketID, ticket.ID)
		}

		seenTicketIDs[ticket.ID] = struct{}{}
	}

	return nil
}

func buildTicketModel(eventID uint, req dto.CreateTicketRequest) models.TicketType {
	activeStatus := true
	if req.ActiveStatus != nil {
		activeStatus = *req.ActiveStatus
	}

	return models.TicketType{
		EventID:        eventID,
		Name:           strings.TrimSpace(req.Name),
		Description:    strings.TrimSpace(req.Description),
		Price:          req.Price,
		Quota:          req.Quota,
		RemainingQuota: req.Quota,
		SalesStartAt:   req.SalesStartAt,
		SalesEndAt:     req.SalesEndAt,
		ActiveStatus:   activeStatus,
	}
}

func buildUpsertTicketModel(eventID uint, req dto.UpsertTicketRequest) models.TicketType {
	activeStatus := true
	if req.ActiveStatus != nil {
		activeStatus = *req.ActiveStatus
	}

	return models.TicketType{
		EventID:        eventID,
		Name:           strings.TrimSpace(req.Name),
		Description:    strings.TrimSpace(req.Description),
		Price:          req.Price,
		Quota:          req.Quota,
		RemainingQuota: req.Quota,
		SalesStartAt:   req.SalesStartAt,
		SalesEndAt:     req.SalesEndAt,
		ActiveStatus:   activeStatus,
	}
}

func (s *eventService) GetPublishedEvents(ctx context.Context, query dto.EventListQuery) ([]models.Event, error) {
	ctx, cancel := withEventTimeout(ctx)
	defer cancel()

	query = normalizeEventListQuery(query)
	return s.repo.FindAllPublished(ctx, time.Now(), query.Limit, query.Offset)
}

func (s *eventService) GetPublishedEventByID(ctx context.Context, id uint) (*models.Event, error) {
	ctx, cancel := withEventTimeout(ctx)
	defer cancel()

	event, err := s.repo.FindPublishedByID(ctx, id, time.Now())
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrEventNotFound
		}

		return nil, err
	}

	return event, nil
}

func (s *eventService) GetAllEvents(ctx context.Context, query dto.EventListQuery) ([]models.Event, error) {
	ctx, cancel := withEventTimeout(ctx)
	defer cancel()

	query = normalizeEventListQuery(query)
	return s.repo.FindAll(ctx, query.Limit, query.Offset, query.PublishStatus, query.ActiveOnly, time.Now())
}

func (s *eventService) GetEventByID(ctx context.Context, id uint) (*models.Event, error) {
	ctx, cancel := withEventTimeout(ctx)
	defer cancel()

	event, err := s.repo.FindByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrEventNotFound
		}

		return nil, err
	}

	return event, nil
}

func (s *eventService) CreateEvent(ctx context.Context, req dto.CreateEventRequest) (*models.Event, error) {
	ctx, cancel := withEventTimeout(ctx)
	defer cancel()

	if err := validateEventDateRange(req.StartDate, req.EndDate); err != nil {
		return nil, err
	}

	if err := validateTicketRequests(req.EndDate, req.TicketTypes); err != nil {
		return nil, err
	}

	tx := s.repo.BeginTx(ctx)
	if tx.Error != nil {
		return nil, tx.Error
	}

	defer func() {
		if recovered := recover(); recovered != nil {
			tx.Rollback()
			panic(recovered)
		}
	}()

	publishStatus := req.PublishStatus
	if publishStatus == "" {
		publishStatus = "draft"
	}

	event := &models.Event{
		Title:         strings.TrimSpace(req.Title),
		Slug:          generateSlug(req.Title),
		Description:   strings.TrimSpace(req.Description),
		Location:      strings.TrimSpace(req.Location),
		StartDate:     req.StartDate,
		EndDate:       req.EndDate,
		BannerURL:     normalizeOptionalString(req.BannerURL),
		PublishStatus: publishStatus,
	}

	committed := false
	defer func() {
		if !committed {
			_ = utils.DeleteManagedUpload(event.BannerURL)
		}
	}()

	if err := s.repo.CreateWithTx(tx, event); err != nil {
		tx.Rollback()
		return nil, err
	}

	tickets := make([]models.TicketType, 0, len(req.TicketTypes))
	for _, ticketReq := range req.TicketTypes {
		tickets = append(tickets, buildTicketModel(event.ID, ticketReq))
	}

	if err := s.repo.BulkCreateTicketsWithTx(tx, tickets); err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}
	committed = true

	createdEvent, err := s.repo.FindByID(ctx, event.ID)
	if err != nil {
		return nil, err
	}

	return createdEvent, nil
}

func (s *eventService) UpdateEvent(ctx context.Context, id uint, req dto.UpdateEventRequest) (*models.Event, error) {
	ctx, cancel := withEventTimeout(ctx)
	defer cancel()

	if err := validateEventDateRange(req.StartDate, req.EndDate); err != nil {
		return nil, err
	}

	tx := s.repo.BeginTx(ctx)
	if tx.Error != nil {
		return nil, tx.Error
	}

	defer func() {
		if recovered := recover(); recovered != nil {
			tx.Rollback()
			panic(recovered)
		}
	}()

	event, err := s.repo.FindByIDWithTx(tx, id)
	if err != nil {
		tx.Rollback()
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrEventNotFound
		}

		return nil, err
	}

	previousBannerURL := event.BannerURL

	if req.TicketTypes == nil {
		for _, ticket := range event.TicketTypes {
			if ticket.SalesEndAt.After(req.EndDate) {
				tx.Rollback()
				return nil, ErrEventEndBeforeExistingTicket
			}
		}
	} else if err := validateUpsertTicketRequests(req.EndDate, *req.TicketTypes); err != nil {
		tx.Rollback()
		return nil, err
	}

	event.Title = strings.TrimSpace(req.Title)
	event.Description = strings.TrimSpace(req.Description)
	event.Location = strings.TrimSpace(req.Location)
	event.StartDate = req.StartDate
	event.EndDate = req.EndDate
	if req.BannerURL != nil {
		event.BannerURL = normalizeOptionalString(req.BannerURL)
	}
	event.PublishStatus = req.PublishStatus

	bannerChanged := !sameOptionalString(previousBannerURL, event.BannerURL)
	committed := false
	defer func() {
		if !committed && bannerChanged {
			_ = utils.DeleteManagedUpload(event.BannerURL)
		}
	}()

	if err := s.repo.UpdateWithTx(tx, event); err != nil {
		tx.Rollback()
		return nil, err
	}

	if req.TicketTypes != nil {
		existingTicketsByID := make(map[uint]*models.TicketType, len(event.TicketTypes))
		for i := range event.TicketTypes {
			ticket := &event.TicketTypes[i]
			existingTicketsByID[ticket.ID] = ticket
		}

		keptExistingIDs := make([]uint, 0, len(event.TicketTypes))
		newTickets := make([]models.TicketType, 0, len(*req.TicketTypes))

		for _, ticketReq := range *req.TicketTypes {
			if ticketReq.ID == 0 {
				newTickets = append(newTickets, buildUpsertTicketModel(id, ticketReq))
				continue
			}

			existingTicket, exists := existingTicketsByID[ticketReq.ID]
			if !exists {
				tx.Rollback()
				return nil, ErrTicketNotInEvent
			}

			soldQuantity := existingTicket.Quota - existingTicket.RemainingQuota
			if ticketReq.Quota < soldQuantity {
				tx.Rollback()
				return nil, fmt.Errorf("%w: %s", ErrTicketQuotaBelowSold, existingTicket.Name)
			}

			activeStatus := existingTicket.ActiveStatus
			if ticketReq.ActiveStatus != nil {
				activeStatus = *ticketReq.ActiveStatus
			}

			existingTicket.Name = strings.TrimSpace(ticketReq.Name)
			existingTicket.Description = strings.TrimSpace(ticketReq.Description)
			existingTicket.Price = ticketReq.Price
			existingTicket.Quota = ticketReq.Quota
			existingTicket.RemainingQuota = ticketReq.Quota - soldQuantity
			existingTicket.SalesStartAt = ticketReq.SalesStartAt
			existingTicket.SalesEndAt = ticketReq.SalesEndAt
			existingTicket.ActiveStatus = activeStatus

			if err := s.repo.UpdateTicketWithTx(tx, existingTicket); err != nil {
				tx.Rollback()
				return nil, err
			}

			keptExistingIDs = append(keptExistingIDs, existingTicket.ID)
		}

		if err := s.repo.DeactivateTicketsExceptWithTx(tx, event.ID, keptExistingIDs); err != nil {
			tx.Rollback()
			return nil, err
		}

		if err := s.repo.BulkCreateTicketsWithTx(tx, newTickets); err != nil {
			tx.Rollback()
			return nil, err
		}
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}
	committed = true

	if bannerChanged {
		_ = utils.DeleteManagedUpload(previousBannerURL)
	}

	updatedEvent, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	return updatedEvent, nil
}

func (s *eventService) DeleteEvent(ctx context.Context, id uint) error {
	ctx, cancel := withEventTimeout(ctx)
	defer cancel()

	tx := s.repo.BeginTx(ctx)
	if tx.Error != nil {
		return tx.Error
	}

	defer func() {
		if recovered := recover(); recovered != nil {
			tx.Rollback()
			panic(recovered)
		}
	}()

	event, err := s.repo.FindByIDWithTx(tx, id)
	if err != nil {
		tx.Rollback()
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrEventNotFound
		}

		return err
	}

	if err := s.repo.DeleteTicketsByEventWithTx(tx, event.ID); err != nil {
		tx.Rollback()
		return err
	}

	if err := s.repo.DeleteWithTx(tx, event); err != nil {
		tx.Rollback()
		return err
	}

	if err := tx.Commit().Error; err != nil {
		return err
	}

	_ = utils.DeleteManagedUpload(event.BannerURL)

	return nil
}

func (s *eventService) CreateTicket(ctx context.Context, eventID uint, req dto.CreateTicketRequest) (*models.TicketType, error) {
	ctx, cancel := withEventTimeout(ctx)
	defer cancel()

	event, err := s.repo.FindByID(ctx, eventID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrEventNotFound
		}

		return nil, err
	}

	if err := validateTicketRequests(event.EndDate, []dto.CreateTicketRequest{req}); err != nil {
		return nil, err
	}

	ticketModel := buildTicketModel(eventID, req)
	ticket := &ticketModel

	if err := s.repo.CreateTicket(ctx, ticket); err != nil {
		return nil, err
	}

	return ticket, nil
}

func (s *eventService) UpdateTicketStatus(ctx context.Context, ticketID uint, req dto.UpdateTicketRequest) (*models.TicketType, error) {
	ctx, cancel := withEventTimeout(ctx)
	defer cancel()

	ticket, err := s.repo.FindTicketByID(ctx, ticketID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrTicketTypeNotFound
		}

		return nil, err
	}

	ticket.ActiveStatus = *req.ActiveStatus

	if err := s.repo.UpdateTicket(ctx, ticket); err != nil {
		return nil, err
	}

	return ticket, nil
}

func (s *eventService) DeleteTicket(ctx context.Context, ticketID uint) error {
	ctx, cancel := withEventTimeout(ctx)
	defer cancel()

	ticket, err := s.repo.FindTicketByID(ctx, ticketID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrTicketTypeNotFound
		}

		return err
	}

	if ticket.Quota-ticket.RemainingQuota > 0 {
		return ErrCannotDeleteSoldTicket
	}

	return s.repo.DeleteTicket(ctx, ticket)
}
