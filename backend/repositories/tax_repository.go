package repositories

import (
	"context"
	"mastutik-api/models"

	"gorm.io/gorm"
)

type TaxRepository interface {
	Create(ctx context.Context, tax *models.Tax) error
	FindAll(ctx context.Context) ([]models.Tax, error)
	FindActive(ctx context.Context) ([]models.Tax, error)
	FindByID(ctx context.Context, id uint) (*models.Tax, error)
	Update(ctx context.Context, tax *models.Tax) error
	Delete(ctx context.Context, id uint) error
}

type taxRepository struct {
	db *gorm.DB
}

func NewTaxRepository(db *gorm.DB) TaxRepository {
	return &taxRepository{db: db}
}

func (r *taxRepository) Create(ctx context.Context, tax *models.Tax) error {
	return r.db.WithContext(ctx).Create(tax).Error
}

func (r *taxRepository) FindAll(ctx context.Context) ([]models.Tax, error) {
	var taxes []models.Tax
	err := r.db.WithContext(ctx).Order("id des").Find(&taxes).Error
	return taxes, err
}

func (r *taxRepository) FindActive(ctx context.Context) ([]models.Tax, error) {
	var taxes []models.Tax
	err := r.db.WithContext(ctx).Where("active_status = ?", true).Find(&taxes).Error
	return taxes, err
}

func (r *taxRepository) FindByID(ctx context.Context, id uint) (*models.Tax, error) {
	var tax models.Tax
	err := r.db.WithContext(ctx).First(&tax, id).Error
	if err != nil {
		return nil, err
	}
	return &tax, nil
}

func (r *taxRepository) Update(ctx context.Context, tax *models.Tax) error {
	return r.db.WithContext(ctx).Save(tax).Error
}

func (r *taxRepository) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&models.Tax{}, id).Error
}
