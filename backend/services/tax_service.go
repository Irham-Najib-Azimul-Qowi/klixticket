package services

import (
	"context"
	"mastutik-api/dto"
	"mastutik-api/models"
	"mastutik-api/repositories"
)

type TaxService interface {
	CreateTax(ctx context.Context, req dto.CreateTaxRequest) (*models.Tax, error)
	GetAllTaxes(ctx context.Context) ([]models.Tax, error)
	GetActiveTaxes(ctx context.Context) ([]models.Tax, error)
	UpdateTax(ctx context.Context, id uint, req dto.UpdateTaxRequest) (*models.Tax, error)
	DeleteTax(ctx context.Context, id uint) error
}

type taxService struct {
	repo repositories.TaxRepository
}

func NewTaxService(repo repositories.TaxRepository) TaxService {
	return &taxService{repo: repo}
}

func (s *taxService) CreateTax(ctx context.Context, req dto.CreateTaxRequest) (*models.Tax, error) {
	tax := &models.Tax{
		Name:         req.Name,
		Percentage:   req.Percentage,
		ActiveStatus: req.ActiveStatus,
	}
	err := s.repo.Create(ctx, tax)
	return tax, err
}

func (s *taxService) GetAllTaxes(ctx context.Context) ([]models.Tax, error) {
	return s.repo.FindAll(ctx)
}

func (s *taxService) GetActiveTaxes(ctx context.Context) ([]models.Tax, error) {
	return s.repo.FindActive(ctx)
}

func (s *taxService) UpdateTax(ctx context.Context, id uint, req dto.UpdateTaxRequest) (*models.Tax, error) {
	tax, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if req.Name != nil {
		tax.Name = *req.Name
	}
	if req.Percentage != nil {
		tax.Percentage = *req.Percentage
	}
	if req.ActiveStatus != nil {
		tax.ActiveStatus = *req.ActiveStatus
	}

	err = s.repo.Update(ctx, tax)
	return tax, err
}

func (s *taxService) DeleteTax(ctx context.Context, id uint) error {
	return s.repo.Delete(ctx, id)
}
