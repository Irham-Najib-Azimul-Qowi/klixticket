package repositories

import (
	"context"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"mastutik-api/models"
)

type MerchandiseRepository interface {
	FindAllActive(ctx context.Context, limit, offset int) ([]models.Merchandise, error)
	FindAll(ctx context.Context, limit, offset int) ([]models.Merchandise, error)
	FindByID(ctx context.Context, id uint) (*models.Merchandise, error)
	Create(ctx context.Context, merchandise *models.Merchandise) error
	Update(ctx context.Context, merchandise *models.Merchandise) error
	Delete(ctx context.Context, merchandise *models.Merchandise) error
	FindByIDWithLock(tx *gorm.DB, id uint) (*models.Merchandise, error)
	UpdateStockWithTx(tx *gorm.DB, id uint, newStock int) error
}

type merchandiseRepository struct {
	db *gorm.DB
}

func NewMerchandiseRepository(db *gorm.DB) MerchandiseRepository {
	return &merchandiseRepository{db: db}
}

func merchandiseSelectColumns(db *gorm.DB) *gorm.DB {
	return db.Select(
		"id",
		"name",
		"slug",
		"description",
		"price",
		"stock",
		"image_url",
		"active_status",
		"created_at",
		"updated_at",
	)
}

func (r *merchandiseRepository) FindAllActive(ctx context.Context, limit, offset int) ([]models.Merchandise, error) {
	var merchandise []models.Merchandise

	err := merchandiseSelectColumns(r.db.WithContext(ctx)).
		Where("active_status = ?", true).
		Where("stock > 0").
		Order("created_at desc").
		Limit(limit).
		Offset(offset).
		Find(&merchandise).Error
	return merchandise, err
}

func (r *merchandiseRepository) FindAll(ctx context.Context, limit, offset int) ([]models.Merchandise, error) {
	var merchandise []models.Merchandise

	err := merchandiseSelectColumns(r.db.WithContext(ctx)).
		Order("created_at desc").
		Limit(limit).
		Offset(offset).
		Find(&merchandise).Error
	return merchandise, err
}

func (r *merchandiseRepository) FindByID(ctx context.Context, id uint) (*models.Merchandise, error) {
	var merchandise models.Merchandise

	err := merchandiseSelectColumns(r.db.WithContext(ctx)).
		First(&merchandise, id).Error
	if err != nil {
		return nil, err
	}

	return &merchandise, nil
}

func (r *merchandiseRepository) Create(ctx context.Context, merchandise *models.Merchandise) error {
	return r.db.WithContext(ctx).Create(merchandise).Error
}

func (r *merchandiseRepository) Update(ctx context.Context, merchandise *models.Merchandise) error {
	return r.db.WithContext(ctx).Save(merchandise).Error
}

func (r *merchandiseRepository) Delete(ctx context.Context, merchandise *models.Merchandise) error {
	return r.db.WithContext(ctx).Delete(merchandise).Error
}

func (r *merchandiseRepository) FindByIDWithLock(tx *gorm.DB, id uint) (*models.Merchandise, error) {
	var merchandise models.Merchandise

	err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
		First(&merchandise, id).Error
	if err != nil {
		return nil, err
	}

	return &merchandise, nil
}

func (r *merchandiseRepository) UpdateStockWithTx(tx *gorm.DB, id uint, newStock int) error {
	return tx.Model(&models.Merchandise{}).
		Where("id = ?", id).
		Update("stock", newStock).Error
}
