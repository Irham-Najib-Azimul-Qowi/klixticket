package services

import (
	"context"
	"errors"
	"os"

	"google.golang.org/api/idtoken"
	"mastutik-api/internal/models"
	"mastutik-api/internal/repository"
	"mastutik-api/pkg/utils"
)

type AuthService interface {
	RegisterUser(req models.RegisterRequest) (*models.User, error)
	LoginUser(req models.LoginRequest) (*models.AuthResponse, error)
	LoginAdmin(req models.LoginRequest) (*models.AuthResponse, error)
	GoogleLogin(req models.GoogleLoginRequest) (*models.AuthResponse, error)
}

type authService struct {
	userRepo repository.UserRepository
}

func NewAuthService(repo repository.UserRepository) AuthService {
	return &authService{userRepo: repo}
}

func (s *authService) RegisterUser(req models.RegisterRequest) (*models.User, error) {
	// 1. Cek email apakah sudah dipakai
	if existingUser, _ := s.userRepo.FindByEmail(req.Email); existingUser.ID != 0 {
		return nil, errors.New("email already structured / registered")
	}

	// 2. Hash password
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	// 3. Simpan
	user := &models.User{
		Name:         req.Name,
		Email:        req.Email,
		PasswordHash: &hashedPassword,
		Role:         "customer", // default role
	}

	err = s.userRepo.CreateUser(user)
	if err != nil {
		return nil, err
	}

	return user, nil
}

func (s *authService) authenticateWithPassword(req models.LoginRequest) (*models.User, error) {
	user, err := s.userRepo.FindByEmail(req.Email)
	if err != nil || user.ID == 0 {
		return nil, errors.New("invalid email or password")
	}

	if user.PasswordHash == nil {
		return nil, errors.New("please login using your connected google account")
	}

	if !utils.CheckPasswordHash(req.Password, *user.PasswordHash) {
		return nil, errors.New("invalid email or password")
	}

	return user, nil
}

func (s *authService) LoginUser(req models.LoginRequest) (*models.AuthResponse, error) {
	user, err := s.authenticateWithPassword(req)
	if err != nil {
		return nil, err
	}

	token, err := utils.GenerateToken(user.ID, user.Role)
	if err != nil {
		return nil, err
	}

	return &models.AuthResponse{
		Token: token,
		Role:  user.Role,
	}, nil
}

func (s *authService) LoginAdmin(req models.LoginRequest) (*models.AuthResponse, error) {
	user, err := s.authenticateWithPassword(req)
	if err != nil {
		return nil, err
	}

	if user.Role != "admin" {
		return nil, errors.New("unauthorized: you do not have admin privileges")
	}

	token, err := utils.GenerateToken(user.ID, user.Role)
	if err != nil {
		return nil, err
	}

	return &models.AuthResponse{
		Token: token,
		Role:  user.Role,
	}, nil
}

func (s *authService) GoogleLogin(req models.GoogleLoginRequest) (*models.AuthResponse, error) {
	clientID := os.Getenv("GOOGLE_CLIENT_ID")
	if clientID == "" {
		return nil, errors.New("google login temporarily unavailable")
	}

	payload, err := idtoken.Validate(context.Background(), req.IDToken, clientID)
	if err != nil {
		return nil, errors.New("invalid google token")
	}

	googleUserEmail := payload.Claims["email"].(string)
	googleUserName := payload.Claims["name"].(string)
	googleUserID := payload.Subject

	// Cari apakah ada akun OAuth dengan Subject ID tersebut
	existingOAuth, _ := s.userRepo.FindOAuthAccount("google", googleUserID)
	var finalUser *models.User

	if existingOAuth != nil && existingOAuth.ID != 0 {
		// User sudah pernah login pake google
		finalUser, _ = s.userRepo.FindByID(existingOAuth.UserID)
	} else {
		// Belum pernah login pake google.
		// Cari apakah email tersebut ada sebagai login manual
		existingEmailUser, _ := s.userRepo.FindByEmail(googleUserEmail)

		if existingEmailUser != nil && existingEmailUser.ID != 0 {
			// Ada akun dengan password. Hubungkan ke oauth ini.
			finalUser = existingEmailUser
		} else {
			// User 100% baru. Buatkan
			finalUser = &models.User{
				Name:  googleUserName,
				Email: googleUserEmail,
				Role:  "customer",
			}
			if err := s.userRepo.CreateUser(finalUser); err != nil {
				return nil, err
			}
		}

		// Buatkan OAuth Account row as connector
		oAuthRecord := &models.OAuthAccount{
			UserID:         finalUser.ID,
			Provider:       "google",
			ProviderUserID: googleUserID,
		}
		if err := s.userRepo.CreateOAuthAccount(oAuthRecord); err != nil {
			return nil, err
		}
	}

	token, err := utils.GenerateToken(finalUser.ID, finalUser.Role)
	if err != nil {
		return nil, err
	}

	return &models.AuthResponse{
		Token: token,
		Role:  finalUser.Role,
	}, nil
}
