package services

import (
	"context"
	"errors"
	"os"
	"path/filepath"
	"sync"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"mastutik-api/internal/dto"
	"mastutik-api/internal/models"
)

var serviceWorkingDirMu sync.Mutex

type eventRepoStub struct {
	db                 *gorm.DB
	event              *models.Event
	updated            *models.Event
	deleted            *models.Event
	deleteCalls        int
	publicLimit        int
	publicOffset       int
	adminLimit         int
	adminOffset        int
	adminPublishStatus string
	adminActiveOnly    *bool
}

func (r *eventRepoStub) BeginTx(ctx context.Context) *gorm.DB {
	return r.db.WithContext(ctx).Begin()
}

func (r *eventRepoStub) FindAllPublished(_ context.Context, _ time.Time, limit, offset int) ([]models.Event, error) {
	r.publicLimit = limit
	r.publicOffset = offset
	return nil, nil
}

func (r *eventRepoStub) FindPublishedByID(context.Context, uint, time.Time) (*models.Event, error) {
	return nil, nil
}

func (r *eventRepoStub) FindAll(_ context.Context, limit, offset int, publishStatus string, activeOnly *bool, _ time.Time) ([]models.Event, error) {
	r.adminLimit = limit
	r.adminOffset = offset
	r.adminPublishStatus = publishStatus
	r.adminActiveOnly = activeOnly
	return nil, nil
}

func (r *eventRepoStub) FindByID(_ context.Context, id uint) (*models.Event, error) {
	if r.updated != nil && r.updated.ID == id {
		return cloneEvent(r.updated), nil
	}

	if r.event != nil && r.event.ID == id {
		return cloneEvent(r.event), nil
	}

	return nil, gorm.ErrRecordNotFound
}

func (r *eventRepoStub) CountActivePublished(context.Context, time.Time) (int64, error) {
	return 0, nil
}

func (r *eventRepoStub) FindByIDWithTx(_ *gorm.DB, id uint) (*models.Event, error) {
	if r.event != nil && r.event.ID == id {
		return cloneEvent(r.event), nil
	}

	return nil, gorm.ErrRecordNotFound
}

func (r *eventRepoStub) CreateWithTx(_ *gorm.DB, event *models.Event) error {
	r.event = cloneEvent(event)
	return nil
}

func (r *eventRepoStub) BulkCreateTicketsWithTx(_ *gorm.DB, tickets []models.TicketType) error {
	if r.event != nil {
		r.event.TicketTypes = cloneTickets(tickets)
	}
	return nil
}

func (r *eventRepoStub) Update(context.Context, *models.Event) error {
	return nil
}

func (r *eventRepoStub) UpdateWithTx(_ *gorm.DB, event *models.Event) error {
	r.updated = cloneEvent(event)
	r.event = cloneEvent(event)
	return nil
}

func (r *eventRepoStub) DeleteWithTx(_ *gorm.DB, event *models.Event) error {
	r.deleted = cloneEvent(event)
	return nil
}

func (r *eventRepoStub) DeleteTicketsByEventWithTx(_ *gorm.DB, eventID uint) error {
	r.deleteCalls++
	if r.event != nil && r.event.ID == eventID {
		r.event.TicketTypes = nil
	}
	return nil
}

func (r *eventRepoStub) CreateTicket(context.Context, *models.TicketType) error {
	return nil
}

func (r *eventRepoStub) FindTicketByID(context.Context, uint) (*models.TicketType, error) {
	return nil, gorm.ErrRecordNotFound
}

func (r *eventRepoStub) UpdateTicket(context.Context, *models.TicketType) error {
	return nil
}

func (r *eventRepoStub) DeleteTicket(context.Context, *models.TicketType) error {
	return nil
}

func (r *eventRepoStub) UpdateTicketWithTx(_ *gorm.DB, ticket *models.TicketType) error {
	for i := range r.event.TicketTypes {
		if r.event.TicketTypes[i].ID == ticket.ID {
			r.event.TicketTypes[i] = *cloneTicket(ticket)
			return nil
		}
	}

	return nil
}

func (r *eventRepoStub) DeactivateTicketsExceptWithTx(_ *gorm.DB, eventID uint, keepIDs []uint) error {
	if r.event == nil || r.event.ID != eventID {
		return nil
	}

	keep := make(map[uint]struct{}, len(keepIDs))
	for _, id := range keepIDs {
		keep[id] = struct{}{}
	}

	for i := range r.event.TicketTypes {
		if _, exists := keep[r.event.TicketTypes[i].ID]; !exists {
			r.event.TicketTypes[i].ActiveStatus = false
		}
	}

	return nil
}

type merchandiseRepoStub struct {
	merchandise *models.Merchandise
	updated     *models.Merchandise
	deleted     *models.Merchandise
}

func (r *merchandiseRepoStub) FindAllActive(context.Context, int, int) ([]models.Merchandise, error) {
	return nil, nil
}

func (r *merchandiseRepoStub) FindAll(context.Context, int, int) ([]models.Merchandise, error) {
	return nil, nil
}

func (r *merchandiseRepoStub) FindByID(_ context.Context, id uint) (*models.Merchandise, error) {
	if r.merchandise != nil && r.merchandise.ID == id {
		return cloneMerchandise(r.merchandise), nil
	}

	return nil, gorm.ErrRecordNotFound
}

func (r *merchandiseRepoStub) Create(context.Context, *models.Merchandise) error {
	return nil
}

func (r *merchandiseRepoStub) Update(_ context.Context, merchandise *models.Merchandise) error {
	r.updated = cloneMerchandise(merchandise)
	r.merchandise = cloneMerchandise(merchandise)
	return nil
}

func (r *merchandiseRepoStub) Delete(_ context.Context, merchandise *models.Merchandise) error {
	r.deleted = cloneMerchandise(merchandise)
	return nil
}

func (r *merchandiseRepoStub) FindByIDWithLock(*gorm.DB, uint) (*models.Merchandise, error) {
	return nil, gorm.ErrRecordNotFound
}

func (r *merchandiseRepoStub) UpdateStockWithTx(*gorm.DB, uint, int) error {
	return nil
}

func withServiceTempWorkingDir(t *testing.T) string {
	t.Helper()

	serviceWorkingDirMu.Lock()
	originalWD, err := os.Getwd()
	if err != nil {
		serviceWorkingDirMu.Unlock()
		t.Fatalf("getwd: %v", err)
	}

	tempDir := t.TempDir()
	if err := os.Chdir(tempDir); err != nil {
		serviceWorkingDirMu.Unlock()
		t.Fatalf("chdir temp dir: %v", err)
	}

	t.Cleanup(func() {
		_ = os.Chdir(originalWD)
		serviceWorkingDirMu.Unlock()
	})

	return tempDir
}

func newMockGormDB(t *testing.T) (*gorm.DB, sqlmock.Sqlmock) {
	t.Helper()

	sqlDB, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("sqlmock new: %v", err)
	}

	t.Cleanup(func() {
		_ = sqlDB.Close()
	})

	db, err := gorm.Open(postgres.New(postgres.Config{
		Conn:                 sqlDB,
		PreferSimpleProtocol: true,
	}), &gorm.Config{})
	if err != nil {
		t.Fatalf("open gorm with sqlmock: %v", err)
	}

	return db, mock
}

func writeManagedTestFile(t *testing.T, relativePath string) string {
	t.Helper()

	if err := os.MkdirAll(filepath.Dir(relativePath), 0o755); err != nil {
		t.Fatalf("mkdir all: %v", err)
	}

	if err := os.WriteFile(relativePath, []byte("test-image"), 0o644); err != nil {
		t.Fatalf("write file: %v", err)
	}

	return relativePath
}

func cloneOptionalString(value *string) *string {
	if value == nil {
		return nil
	}

	cloned := *value
	return &cloned
}

func cloneTicket(ticket *models.TicketType) *models.TicketType {
	if ticket == nil {
		return nil
	}

	cloned := *ticket
	return &cloned
}

func cloneTickets(tickets []models.TicketType) []models.TicketType {
	if tickets == nil {
		return nil
	}

	cloned := make([]models.TicketType, len(tickets))
	copy(cloned, tickets)
	return cloned
}

func cloneEvent(event *models.Event) *models.Event {
	if event == nil {
		return nil
	}

	cloned := *event
	cloned.BannerURL = cloneOptionalString(event.BannerURL)
	cloned.TicketTypes = cloneTickets(event.TicketTypes)
	return &cloned
}

func cloneMerchandise(merchandise *models.Merchandise) *models.Merchandise {
	if merchandise == nil {
		return nil
	}

	cloned := *merchandise
	cloned.ImageURL = cloneOptionalString(merchandise.ImageURL)
	return &cloned
}

func TestEventServiceUpdateEvent_PreservesBannerURLWhenRequestOmitted(t *testing.T) {
	withServiceTempWorkingDir(t)

	oldBannerPath := filepath.Join("uploads", "images", "events", "existing-banner.png")
	writeManagedTestFile(t, oldBannerPath)

	db, mock := newMockGormDB(t)
	mock.ExpectBegin()
	mock.ExpectCommit()

	oldBannerURL := "/uploads/images/events/existing-banner.png"
	repo := &eventRepoStub{
		db: db,
		event: &models.Event{
			ID:            1,
			Title:         "Existing Event",
			Slug:          "existing-event",
			Description:   "Old description",
			Location:      "Jakarta",
			StartDate:     time.Now().UTC().Add(24 * time.Hour),
			EndDate:       time.Now().UTC().Add(48 * time.Hour),
			BannerURL:     &oldBannerURL,
			PublishStatus: "draft",
		},
	}
	service := NewEventService(repo)

	updated, err := service.UpdateEvent(context.Background(), 1, dto.UpdateEventRequest{
		Title:         "Updated Event",
		Description:   "Updated description",
		Location:      "Bandung",
		StartDate:     time.Now().UTC().Add(72 * time.Hour),
		EndDate:       time.Now().UTC().Add(96 * time.Hour),
		PublishStatus: "published",
	})
	if err != nil {
		t.Fatalf("update event: %v", err)
	}

	if updated.BannerURL == nil || *updated.BannerURL != oldBannerURL {
		t.Fatalf("expected banner URL %q to be preserved, got %#v", oldBannerURL, updated.BannerURL)
	}

	if _, err := os.Stat(oldBannerPath); err != nil {
		t.Fatalf("expected old banner file to remain, stat err=%v", err)
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("sqlmock expectations: %v", err)
	}
}

func TestEventServiceGetPublishedEvents_NormalizesPagination(t *testing.T) {
	repo := &eventRepoStub{}
	service := NewEventService(repo)

	if _, err := service.GetPublishedEvents(context.Background(), dto.EventListQuery{}); err != nil {
		t.Fatalf("get published events: %v", err)
	}

	if repo.publicLimit != 10 || repo.publicOffset != 0 {
		t.Fatalf("expected normalized pagination limit=10 offset=0, got limit=%d offset=%d", repo.publicLimit, repo.publicOffset)
	}
}

func TestEventServiceGetAllEvents_AppliesFiltersAndClamp(t *testing.T) {
	repo := &eventRepoStub{}
	service := NewEventService(repo)
	activeOnly := false

	if _, err := service.GetAllEvents(context.Background(), dto.EventListQuery{
		Limit:         250,
		Offset:        7,
		PublishStatus: "published",
		ActiveOnly:    &activeOnly,
	}); err != nil {
		t.Fatalf("get all events: %v", err)
	}

	if repo.adminLimit != 100 || repo.adminOffset != 7 {
		t.Fatalf("expected normalized admin pagination limit=100 offset=7, got limit=%d offset=%d", repo.adminLimit, repo.adminOffset)
	}

	if repo.adminPublishStatus != "published" {
		t.Fatalf("expected publish status filter to be forwarded, got %q", repo.adminPublishStatus)
	}

	if repo.adminActiveOnly == nil || *repo.adminActiveOnly {
		t.Fatalf("expected active_only=false to be forwarded, got %#v", repo.adminActiveOnly)
	}
}

func TestEventServiceDeleteEvent_RemovesManagedBannerFile(t *testing.T) {
	withServiceTempWorkingDir(t)

	bannerPath := filepath.Join("uploads", "images", "events", "event-banner.png")
	writeManagedTestFile(t, bannerPath)

	db, mock := newMockGormDB(t)
	mock.ExpectBegin()
	mock.ExpectCommit()

	bannerURL := "/uploads/images/events/event-banner.png"
	repo := &eventRepoStub{
		db: db,
		event: &models.Event{
			ID:            1,
			Title:         "Event To Delete",
			Slug:          "event-to-delete",
			Description:   "Delete me",
			Location:      "Jakarta",
			StartDate:     time.Now().UTC().Add(24 * time.Hour),
			EndDate:       time.Now().UTC().Add(48 * time.Hour),
			BannerURL:     &bannerURL,
			PublishStatus: "draft",
		},
	}
	service := NewEventService(repo)

	if err := service.DeleteEvent(context.Background(), 1); err != nil {
		t.Fatalf("delete event: %v", err)
	}

	if _, err := os.Stat(bannerPath); !errors.Is(err, os.ErrNotExist) {
		t.Fatalf("expected banner file to be deleted, stat err=%v", err)
	}

	if repo.deleted == nil || repo.deleted.ID != 1 {
		t.Fatalf("expected event delete to be called, got %#v", repo.deleted)
	}

	if repo.deleteCalls != 1 {
		t.Fatalf("expected ticket cleanup to be called once, got %d", repo.deleteCalls)
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("sqlmock expectations: %v", err)
	}
}

func TestMerchandiseServiceUpdateMerchandise_PreservesImageURLWhenRequestOmitted(t *testing.T) {
	withServiceTempWorkingDir(t)

	oldImagePath := filepath.Join("uploads", "images", "merchandise", "existing-merch.png")
	writeManagedTestFile(t, oldImagePath)

	oldImageURL := "/uploads/images/merchandise/existing-merch.png"
	activeStatus := true
	repo := &merchandiseRepoStub{
		merchandise: &models.Merchandise{
			ID:           1,
			Name:         "T-Shirt",
			Slug:         "t-shirt",
			Description:  "Old merch",
			Price:        100000,
			Stock:        20,
			ImageURL:     &oldImageURL,
			ActiveStatus: true,
		},
	}
	service := NewMerchandiseService(repo)

	updated, err := service.UpdateMerchandise(context.Background(), 1, dto.UpdateMerchandiseRequest{
		Name:         "Hoodie",
		Description:  "Updated merch",
		Price:        200000,
		Stock:        15,
		ActiveStatus: &activeStatus,
	})
	if err != nil {
		t.Fatalf("update merchandise: %v", err)
	}

	if updated.ImageURL == nil || *updated.ImageURL != oldImageURL {
		t.Fatalf("expected image URL %q to be preserved, got %#v", oldImageURL, updated.ImageURL)
	}

	if _, err := os.Stat(oldImagePath); err != nil {
		t.Fatalf("expected old image file to remain, stat err=%v", err)
	}
}

func TestMerchandiseServiceDeleteMerchandise_RemovesManagedImageFile(t *testing.T) {
	withServiceTempWorkingDir(t)

	imagePath := filepath.Join("uploads", "images", "merchandise", "merch-image.png")
	writeManagedTestFile(t, imagePath)

	imageURL := "/uploads/images/merchandise/merch-image.png"
	repo := &merchandiseRepoStub{
		merchandise: &models.Merchandise{
			ID:           1,
			Name:         "Poster",
			Slug:         "poster",
			Description:  "Delete me",
			Price:        50000,
			Stock:        5,
			ImageURL:     &imageURL,
			ActiveStatus: true,
		},
	}
	service := NewMerchandiseService(repo)

	if err := service.DeleteMerchandise(context.Background(), 1); err != nil {
		t.Fatalf("delete merchandise: %v", err)
	}

	if _, err := os.Stat(imagePath); !errors.Is(err, os.ErrNotExist) {
		t.Fatalf("expected image file to be deleted, stat err=%v", err)
	}

	if repo.deleted == nil || repo.deleted.ID != 1 {
		t.Fatalf("expected merchandise delete to be called, got %#v", repo.deleted)
	}
}
