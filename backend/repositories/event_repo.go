package repositories

import (
	"context"
	"time"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"mastutik-api/models"
)

type EventRepository interface {
	BeginTx(ctx context.Context) *gorm.DB

	// Public
	FindAllPublished(ctx context.Context, now time.Time, limit, offset int) ([]models.Event, error)
	FindPublishedByID(ctx context.Context, id uint, now time.Time) (*models.Event, error)

	// Admin
	FindAll(ctx context.Context, limit, offset int, publishStatus string, activeOnly *bool, now time.Time) ([]models.Event, error)
	FindByID(ctx context.Context, id uint) (*models.Event, error)
	CountActivePublished(ctx context.Context, now time.Time) (int64, error)
	FindByIDWithTx(tx *gorm.DB, id uint) (*models.Event, error)
	CreateWithTx(tx *gorm.DB, event *models.Event) error
	BulkCreateTicketsWithTx(tx *gorm.DB, tickets []models.TicketType) error
	Update(ctx context.Context, event *models.Event) error
	UpdateWithTx(tx *gorm.DB, event *models.Event) error
	Count(ctx context.Context) (int64, error)
	DeleteWithTx(tx *gorm.DB, event *models.Event) error
	DeleteTicketsByEventWithTx(tx *gorm.DB, eventID uint) error

	// Tickets
	CreateTicket(ctx context.Context, ticket *models.TicketType) error
	FindTicketByID(ctx context.Context, id uint) (*models.TicketType, error)
	UpdateTicket(ctx context.Context, ticket *models.TicketType) error
	DeleteTicket(ctx context.Context, ticket *models.TicketType) error
	UpdateTicketWithTx(tx *gorm.DB, ticket *models.TicketType) error
	DeactivateTicketsExceptWithTx(tx *gorm.DB, eventID uint, keepIDs []uint) error
}

type eventRepository struct {
	db *gorm.DB
}

func NewEventRepository(db *gorm.DB) EventRepository {
	return &eventRepository{db}
}

func (r *eventRepository) BeginTx(ctx context.Context) *gorm.DB {
	return r.db.WithContext(ctx).Begin()
}

func eventSelectColumns(db *gorm.DB) *gorm.DB {
	return db.Select(
		"id",
		"title",
		"slug",
		"description",
		"location",
		"start_date",
		"end_date",
		"banner_url",
		"publish_status",
		"created_at",
		"updated_at",
	)
}

func ticketSelectColumns(db *gorm.DB) *gorm.DB {
	return db.Select(
		"id",
		"event_id",
		"name",
		"description",
		"price",
		"quota",
		"remaining_quota",
		"sales_start_at",
		"sales_end_at",
		"active_status",
		"created_at",
		"updated_at",
	)
}

func (r *eventRepository) FindAllPublished(ctx context.Context, now time.Time, limit, offset int) ([]models.Event, error) {
	var events []models.Event

	err := eventSelectColumns(r.db.WithContext(ctx)).
		Preload("TicketTypes", func(db *gorm.DB) *gorm.DB {
			return ticketSelectColumns(db).
				Where("active_status = ?", true).
				Where("sales_start_at <= ?", now).
				Where("sales_end_at >= ?", now).
				Order("sales_start_at asc")
		}).
		Where("publish_status = ?", "published").
		Where("end_date >= ?", now).
		Order("start_date asc").
		Limit(limit).
		Offset(offset).
		Find(&events).Error
	return events, err
}

func (r *eventRepository) FindPublishedByID(ctx context.Context, id uint, now time.Time) (*models.Event, error) {
	var event models.Event

	err := eventSelectColumns(r.db.WithContext(ctx)).
		Preload("TicketTypes", func(db *gorm.DB) *gorm.DB {
			return ticketSelectColumns(db).
				Where("active_status = ?", true).
				Where("sales_start_at <= ?", now).
				Where("sales_end_at >= ?", now).
				Order("sales_start_at asc")
		}).
		Where("publish_status = ?", "published").
		First(&event, id).Error
	if err != nil {
		return nil, err
	}

	return &event, err
}

func (r *eventRepository) FindAll(ctx context.Context, limit, offset int, publishStatus string, activeOnly *bool, now time.Time) ([]models.Event, error) {
	var events []models.Event

	query := eventSelectColumns(r.db.WithContext(ctx)).
		Order("created_at desc").
		Limit(limit).
		Offset(offset)

	if publishStatus != "" {
		query = query.Where("publish_status = ?", publishStatus)
	}

	if activeOnly != nil {
		if *activeOnly {
			query = query.Where("end_date >= ?", now)
		} else {
			query = query.Where("end_date < ?", now)
		}
	}

	err := query.Find(&events).Error
	return events, err
}

func (r *eventRepository) FindByID(ctx context.Context, id uint) (*models.Event, error) {
	var event models.Event

	err := eventSelectColumns(r.db.WithContext(ctx)).
		Preload("TicketTypes", func(db *gorm.DB) *gorm.DB {
			return ticketSelectColumns(db).Order("sales_start_at asc")
		}).
		First(&event, id).Error
	if err != nil {
		return nil, err
	}

	return &event, nil
}

func (r *eventRepository) Count(ctx context.Context) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&models.Event{}).Count(&count).Error
	return count, err
}

func (r *eventRepository) CountActivePublished(ctx context.Context, now time.Time) (int64, error) {
	var count int64

	err := r.db.WithContext(ctx).
		Model(&models.Event{}).
		Where("publish_status = ?", "published").
		Where("end_date >= ?", now).
		Count(&count).Error
	return count, err
}

func (r *eventRepository) FindByIDWithTx(tx *gorm.DB, id uint) (*models.Event, error) {
	var event models.Event

	err := eventSelectColumns(tx).
		Clauses(clause.Locking{Strength: "UPDATE"}).
		Preload("TicketTypes", func(db *gorm.DB) *gorm.DB {
			return ticketSelectColumns(db).
				Clauses(clause.Locking{Strength: "UPDATE"}).
				Order("sales_start_at asc")
		}).
		First(&event, id).Error
	if err != nil {
		return nil, err
	}

	return &event, nil
}

func (r *eventRepository) CreateWithTx(tx *gorm.DB, event *models.Event) error {
	return tx.Create(event).Error
}

func (r *eventRepository) BulkCreateTicketsWithTx(tx *gorm.DB, tickets []models.TicketType) error {
	if len(tickets) == 0 {
		return nil
	}

	return tx.CreateInBatches(&tickets, 100).Error
}

func (r *eventRepository) Update(ctx context.Context, event *models.Event) error {
	return r.db.WithContext(ctx).Save(event).Error
}

func (r *eventRepository) UpdateWithTx(tx *gorm.DB, event *models.Event) error {
	return tx.Save(event).Error
}

func (r *eventRepository) DeleteWithTx(tx *gorm.DB, event *models.Event) error {
	return tx.Delete(event).Error
}

func (r *eventRepository) DeleteTicketsByEventWithTx(tx *gorm.DB, eventID uint) error {
	return tx.Where("event_id = ?", eventID).Delete(&models.TicketType{}).Error
}

func (r *eventRepository) CreateTicket(ctx context.Context, ticket *models.TicketType) error {
	return r.db.WithContext(ctx).Create(ticket).Error
}

func (r *eventRepository) FindTicketByID(ctx context.Context, id uint) (*models.TicketType, error) {
	var ticket models.TicketType

	err := ticketSelectColumns(r.db.WithContext(ctx)).First(&ticket, id).Error
	if err != nil {
		return nil, err
	}

	return &ticket, nil
}

func (r *eventRepository) UpdateTicket(ctx context.Context, ticket *models.TicketType) error {
	return r.db.WithContext(ctx).Save(ticket).Error
}

func (r *eventRepository) DeleteTicket(ctx context.Context, ticket *models.TicketType) error {
	return r.db.WithContext(ctx).Delete(ticket).Error
}

func (r *eventRepository) UpdateTicketWithTx(tx *gorm.DB, ticket *models.TicketType) error {
	return tx.Save(ticket).Error
}

func (r *eventRepository) DeactivateTicketsExceptWithTx(tx *gorm.DB, eventID uint, keepIDs []uint) error {
	query := tx.Model(&models.TicketType{}).Where("event_id = ?", eventID)
	if len(keepIDs) > 0 {
		query = query.Where("id NOT IN ?", keepIDs)
	}

	return query.Update("active_status", false).Error
}
