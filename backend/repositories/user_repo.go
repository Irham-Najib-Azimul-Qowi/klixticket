package repositories

import (
	"gorm.io/gorm"
	"mastutik-api/models"
)

type UserRepository interface {
	CreateUser(user *models.User) error
	FindByEmail(email string) (*models.User, error)
	FindByID(id uint) (*models.User, error)
	CreateOAuthAccount(oauth *models.OAuthAccount) error
	FindOAuthAccount(provider, providerUserID string) (*models.OAuthAccount, error)
	UpdateUser(user *models.User) error
	FindByResetToken(token string) (*models.User, error)
}

type userRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepository{db}
}

func (r *userRepository) CreateUser(user *models.User) error {
	return r.db.Create(user).Error
}

func (r *userRepository) FindByEmail(email string) (*models.User, error) {
	var user models.User
	err := r.db.Where("email = ?", email).First(&user).Error
	return &user, err
}

func (r *userRepository) FindByID(id uint) (*models.User, error) {
	var user models.User
	err := r.db.First(&user, id).Error
	return &user, err
}

func (r *userRepository) CreateOAuthAccount(oauth *models.OAuthAccount) error {
	return r.db.Create(oauth).Error
}

func (r *userRepository) FindOAuthAccount(provider, providerUserID string) (*models.OAuthAccount, error) {
	var oauth models.OAuthAccount
	err := r.db.Where("provider = ? AND provider_user_id = ?", provider, providerUserID).First(&oauth).Error
	return &oauth, err
}
func (r *userRepository) UpdateUser(user *models.User) error {
	return r.db.Save(user).Error
}

func (r *userRepository) FindByResetToken(token string) (*models.User, error) {
	var user models.User
	err := r.db.Where("reset_password_token = ?", token).First(&user).Error
	return &user, err
}
