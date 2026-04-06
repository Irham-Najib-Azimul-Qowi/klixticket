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

var ErrMerchandiseNotFound = errors.New("merchandise not found")

type MerchandiseService interface {
	GetPublicMerchandise(ctx context.Context, query dto.MerchandiseListQuery) ([]models.Merchandise, error)
	GetAllMerchandise(ctx context.Context, query dto.MerchandiseListQuery) ([]models.Merchandise, error)
	GetMerchandiseByID(ctx context.Context, id uint) (*models.Merchandise, error)
	CreateMerchandise(ctx context.Context, req dto.CreateMerchandiseRequest) (*models.Merchandise, error)
	UpdateMerchandise(ctx context.Context, id uint, req dto.UpdateMerchandiseRequest) (*models.Merchandise, error)
	DeleteMerchandise(ctx context.Context, id uint) error
}

type merchandiseService struct {
	repo repositories.MerchandiseRepository
}

var nonMerchSlugCharacterPattern = regexp.MustCompile(`[^a-z0-9-]+`)

func NewMerchandiseService(repo repositories.MerchandiseRepository) MerchandiseService {
	return &merchandiseService{repo: repo}
}

func normalizeMerchandiseListQuery(query dto.MerchandiseListQuery) dto.MerchandiseListQuery {
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

func generateMerchandiseSlug(name string) string {
	slug := strings.ToLower(strings.TrimSpace(name))
	slug = strings.ReplaceAll(slug, " ", "-")
	slug = nonMerchSlugCharacterPattern.ReplaceAllString(slug, "-")
	slug = strings.Trim(slug, "-")
	if slug == "" {
		slug = "merchandise"
	}

	return fmt.Sprintf("%s-%d", slug, time.Now().UnixMilli())
}

func normalizeOptionalMerchString(value *string) *string {
	if value == nil {
		return nil
	}

	trimmed := strings.TrimSpace(*value)
	if trimmed == "" {
		return nil
	}

	return &trimmed
}

func sameOptionalMerchString(a, b *string) bool {
	switch {
	case a == nil && b == nil:
		return true
	case a == nil || b == nil:
		return false
	default:
		return strings.TrimSpace(*a) == strings.TrimSpace(*b)
	}
}

func (s *merchandiseService) GetPublicMerchandise(ctx context.Context, query dto.MerchandiseListQuery) ([]models.Merchandise, error) {
	ctx, cancel := withOrderTimeout(ctx)
	defer cancel()

	query = normalizeMerchandiseListQuery(query)
	return s.repo.FindAllActive(ctx, query.Limit, query.Offset)
}

func (s *merchandiseService) GetAllMerchandise(ctx context.Context, query dto.MerchandiseListQuery) ([]models.Merchandise, error) {
	ctx, cancel := withOrderTimeout(ctx)
	defer cancel()

	query = normalizeMerchandiseListQuery(query)
	return s.repo.FindAll(ctx, query.Limit, query.Offset)
}

func (s *merchandiseService) GetMerchandiseByID(ctx context.Context, id uint) (*models.Merchandise, error) {
	ctx, cancel := withOrderTimeout(ctx)
	defer cancel()

	merchandise, err := s.repo.FindByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrMerchandiseNotFound
		}

		return nil, err
	}

	return merchandise, nil
}

func (s *merchandiseService) CreateMerchandise(ctx context.Context, req dto.CreateMerchandiseRequest) (*models.Merchandise, error) {
	ctx, cancel := withOrderTimeout(ctx)
	defer cancel()

	activeStatus := true
	if req.ActiveStatus != nil {
		activeStatus = *req.ActiveStatus
	}

	merchandise := &models.Merchandise{
		Name:         strings.TrimSpace(req.Name),
		Slug:         generateMerchandiseSlug(req.Name),
		Description:  strings.TrimSpace(req.Description),
		Price:        req.Price,
		Stock:        req.Stock,
		ImageURL:     normalizeOptionalMerchString(req.ImageURL),
		ActiveStatus: activeStatus,
	}

	created := false
	defer func() {
		if !created {
			_ = utils.DeleteManagedUpload(merchandise.ImageURL)
		}
	}()

	if err := s.repo.Create(ctx, merchandise); err != nil {
		return nil, err
	}
	created = true

	return merchandise, nil
}

func (s *merchandiseService) UpdateMerchandise(ctx context.Context, id uint, req dto.UpdateMerchandiseRequest) (*models.Merchandise, error) {
	ctx, cancel := withOrderTimeout(ctx)
	defer cancel()

	merchandise, err := s.repo.FindByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrMerchandiseNotFound
		}

		return nil, err
	}

	previousImageURL := merchandise.ImageURL
	merchandise.Name = strings.TrimSpace(req.Name)
	merchandise.Description = strings.TrimSpace(req.Description)
	merchandise.Price = req.Price
	merchandise.Stock = req.Stock
	if req.ImageURL != nil {
		merchandise.ImageURL = normalizeOptionalMerchString(req.ImageURL)
	}
	merchandise.ActiveStatus = *req.ActiveStatus

	imageChanged := !sameOptionalMerchString(previousImageURL, merchandise.ImageURL)
	updated := false
	defer func() {
		if !updated && imageChanged {
			_ = utils.DeleteManagedUpload(merchandise.ImageURL)
		}
	}()

	if err := s.repo.Update(ctx, merchandise); err != nil {
		return nil, err
	}
	updated = true

	if imageChanged {
		_ = utils.DeleteManagedUpload(previousImageURL)
	}

	return merchandise, nil
}

func (s *merchandiseService) DeleteMerchandise(ctx context.Context, id uint) error {
	ctx, cancel := withOrderTimeout(ctx)
	defer cancel()

	merchandise, err := s.repo.FindByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrMerchandiseNotFound
		}

		return err
	}

	if err := s.repo.Delete(ctx, merchandise); err != nil {
		return err
	}

	_ = utils.DeleteManagedUpload(merchandise.ImageURL)

	return nil
}
