package handlers

import (
	"bytes"
	"context"
	"errors"
	"io"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"sync"
	"testing"
	"time"

	"github.com/gin-gonic/gin"

	"mastutik-api/internal/dto"
	"mastutik-api/internal/models"
)

var handlerWorkingDirMu sync.Mutex

type noopEventService struct{}

func (noopEventService) GetPublishedEvents(context.Context, dto.EventListQuery) ([]models.Event, error) {
	return nil, nil
}

func (noopEventService) GetPublishedEventByID(context.Context, uint) (*models.Event, error) {
	return nil, nil
}

func (noopEventService) GetAllEvents(context.Context, dto.EventListQuery) ([]models.Event, error) {
	return nil, nil
}

func (noopEventService) GetEventByID(context.Context, uint) (*models.Event, error) {
	return nil, nil
}

func (noopEventService) CreateEvent(context.Context, dto.CreateEventRequest) (*models.Event, error) {
	return nil, errors.New("service should not be called")
}

func (noopEventService) UpdateEvent(context.Context, uint, dto.UpdateEventRequest) (*models.Event, error) {
	return nil, errors.New("service should not be called")
}

func (noopEventService) DeleteEvent(context.Context, uint) error {
	return nil
}

func (noopEventService) CreateTicket(context.Context, uint, dto.CreateTicketRequest) (*models.TicketType, error) {
	return nil, nil
}

func (noopEventService) UpdateTicketStatus(context.Context, uint, dto.UpdateTicketRequest) (*models.TicketType, error) {
	return nil, nil
}

func (noopEventService) DeleteTicket(context.Context, uint) error {
	return nil
}

type noopMerchandiseService struct{}

func (noopMerchandiseService) GetPublicMerchandise(context.Context, dto.MerchandiseListQuery) ([]models.Merchandise, error) {
	return nil, nil
}

func (noopMerchandiseService) GetAllMerchandise(context.Context, dto.MerchandiseListQuery) ([]models.Merchandise, error) {
	return nil, nil
}

func (noopMerchandiseService) GetMerchandiseByID(context.Context, uint) (*models.Merchandise, error) {
	return nil, nil
}

func (noopMerchandiseService) CreateMerchandise(context.Context, dto.CreateMerchandiseRequest) (*models.Merchandise, error) {
	return nil, errors.New("service should not be called")
}

func (noopMerchandiseService) UpdateMerchandise(context.Context, uint, dto.UpdateMerchandiseRequest) (*models.Merchandise, error) {
	return nil, errors.New("service should not be called")
}

func (noopMerchandiseService) DeleteMerchandise(context.Context, uint) error {
	return nil
}

type captureEventService struct {
	noopEventService
	publicQuery dto.EventListQuery
}

func (s *captureEventService) GetPublishedEvents(_ context.Context, query dto.EventListQuery) ([]models.Event, error) {
	s.publicQuery = query
	return []models.Event{}, nil
}

func withHandlerTempWorkingDir(t *testing.T) {
	t.Helper()

	handlerWorkingDirMu.Lock()
	originalWD, err := os.Getwd()
	if err != nil {
		handlerWorkingDirMu.Unlock()
		t.Fatalf("getwd: %v", err)
	}

	tempDir := t.TempDir()
	if err := os.Chdir(tempDir); err != nil {
		handlerWorkingDirMu.Unlock()
		t.Fatalf("chdir temp dir: %v", err)
	}

	t.Cleanup(func() {
		_ = os.Chdir(originalWD)
		handlerWorkingDirMu.Unlock()
	})
}

func newMultipartRequest(t *testing.T, method, target string, fields map[string]string, fileField, fileName string, fileContent []byte) *http.Request {
	t.Helper()

	var body bytes.Buffer
	writer := multipart.NewWriter(&body)

	for key, value := range fields {
		if err := writer.WriteField(key, value); err != nil {
			t.Fatalf("write field %s: %v", key, err)
		}
	}

	if fileField != "" {
		part, err := writer.CreateFormFile(fileField, fileName)
		if err != nil {
			t.Fatalf("create form file: %v", err)
		}

		if _, err := io.Copy(part, bytes.NewReader(fileContent)); err != nil {
			t.Fatalf("write file content: %v", err)
		}
	}

	if err := writer.Close(); err != nil {
		t.Fatalf("close multipart writer: %v", err)
	}

	req := httptest.NewRequest(method, target, &body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	return req
}

func TestEventHandlerCreateEvent_InvalidMultipartCleansUploadedBanner(t *testing.T) {
	withHandlerTempWorkingDir(t)
	gin.SetMode(gin.TestMode)

	router := gin.New()
	router.POST("/events", NewEventHandler(noopEventService{}).CreateEvent)

	req := newMultipartRequest(t, http.MethodPost, "/events", map[string]string{
		"title":          "",
		"description":    "Festival test",
		"location":       "Jakarta",
		"start_date":     time.Now().Add(24 * time.Hour).Format(time.RFC3339),
		"end_date":       time.Now().Add(48 * time.Hour).Format(time.RFC3339),
		"publish_status": "published",
		"ticket_types":   `[{"name":"Presale 1","description":"Batch awal","price":100000,"quota":50,"sales_start_at":"2026-04-10T00:00:00+07:00","sales_end_at":"2026-04-30T23:59:59+07:00"}]`,
	}, "banner", "banner.png", []byte("fake-png-content"))

	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, req)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400, got %d", recorder.Code)
	}

	matches, err := filepath.Glob(filepath.Join("uploads", "images", "events", "*"))
	if err != nil {
		t.Fatalf("glob uploaded files: %v", err)
	}

	if len(matches) != 0 {
		t.Fatalf("expected uploaded banner to be cleaned up, found %d file(s)", len(matches))
	}
}

func TestMerchandiseHandlerCreateMerchandise_InvalidMultipartCleansUploadedImage(t *testing.T) {
	withHandlerTempWorkingDir(t)
	gin.SetMode(gin.TestMode)

	router := gin.New()
	router.POST("/merchandise", NewMerchandiseHandler(noopMerchandiseService{}).CreateMerchandise)

	req := newMultipartRequest(t, http.MethodPost, "/merchandise", map[string]string{
		"name":          "",
		"description":   "Merch test",
		"price":         "125000",
		"stock":         "10",
		"active_status": "true",
	}, "image", "merch.png", []byte("fake-png-content"))

	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, req)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400, got %d", recorder.Code)
	}

	matches, err := filepath.Glob(filepath.Join("uploads", "images", "merchandise", "*"))
	if err != nil {
		t.Fatalf("glob uploaded files: %v", err)
	}

	if len(matches) != 0 {
		t.Fatalf("expected uploaded image to be cleaned up, found %d file(s)", len(matches))
	}
}

func TestEventHandlerGetPublishedEvents_BindsPaginationQuery(t *testing.T) {
	gin.SetMode(gin.TestMode)

	service := &captureEventService{}
	router := gin.New()
	router.GET("/events", NewEventHandler(service).GetPublishedEvents)

	req := httptest.NewRequest(http.MethodGet, "/events?limit=25&offset=5", nil)
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", recorder.Code)
	}

	if service.publicQuery.Limit != 25 || service.publicQuery.Offset != 5 {
		t.Fatalf("expected query limit=25 offset=5, got limit=%d offset=%d", service.publicQuery.Limit, service.publicQuery.Offset)
	}
}
