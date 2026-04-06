package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"mastutik-api/models"
	"mastutik-api/repositories"
	"mastutik-api/services"
	"mastutik-api/pkg/utils"
)

type AuthHandler struct {
	authService services.AuthService
	userRepo    repositories.UserRepository
}

func NewAuthHandler(authService services.AuthService, userRepo repositories.UserRepository) *AuthHandler {
	return &AuthHandler{
		authService: authService,
		userRepo:    userRepo,
	}
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Input tidak valid", utils.FormatValidationError(err))
		return
	}

	user, err := h.authService.RegisterUser(req)
	if err != nil {
		msg := err.Error()
		if msg == "email already structured / registered" {
			msg = "Email sudah terdaftar, silakan gunakan email lain"
		}
		utils.ErrorResponse(c, http.StatusConflict, msg, nil)
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "User registered successfully", gin.H{
		"token": "", // Token is null for register because usually they have to login / auto-login. Let's fix this later if needed.
		"user": gin.H{
			"id":    user.ID,
			"name":  user.Name,
			"email": user.Email,
			"role":  user.Role,
		},
	})
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Input tidak valid", utils.FormatValidationError(err))
		return
	}

	authResponse, err := h.authService.LoginUser(req)
	if err != nil {
		msg := err.Error()
		if msg == "invalid email or password" {
			msg = "Email atau password salah"
		}
		utils.ErrorResponse(c, http.StatusUnauthorized, msg, nil)
		return
	}

	user, _ := h.userRepo.FindByEmail(req.Email)
	utils.SuccessResponse(c, http.StatusOK, "Login successful", gin.H{
		"token": authResponse.Token,
		"role":  authResponse.Role,
		"user": gin.H{
			"id":    user.ID,
			"name":  user.Name,
			"email": user.Email,
			"role":  user.Role,
		},
	})
}

func (h *AuthHandler) AdminLogin(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Input tidak valid", utils.FormatValidationError(err))
		return
	}

	authResponse, err := h.authService.LoginAdmin(req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusUnauthorized, err.Error(), nil)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Admin Login successful", authResponse)
}

func (h *AuthHandler) GoogleLogin(c *gin.Context) {
	var req models.GoogleLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid input payload: id_token required", nil)
		return
	}

	authResponse, err := h.authService.GoogleLogin(req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusUnauthorized, err.Error(), nil)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Google Login successful", authResponse)
}

func (h *AuthHandler) GetMe(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Unauthorized", nil)
		return
	}

	user, err := h.userRepo.FindByID(userID.(uint))
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "User not found", nil)
		return
	}

	// Jangan kembalikan password hash
	utils.SuccessResponse(c, http.StatusOK, "User profile retrieved", gin.H{
		"id":    user.ID,
		"name":  user.Name,
		"email": user.Email,
		"role":  user.Role,
	})
}

func (h *AuthHandler) UpdateMe(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Unauthorized", nil)
		return
	}

	var req models.UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Input tidak valid", utils.FormatValidationError(err))
		return
	}

	user, err := h.userRepo.FindByID(userID.(uint))
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "User not found", nil)
		return
	}

	// Cek jika email mau diubah, apakah sudah dipakai orang lain
	if req.Email != user.Email {
		if existingUser, _ := h.userRepo.FindByEmail(req.Email); existingUser.ID != 0 {
			utils.ErrorResponse(c, http.StatusConflict, "Email sudah terdaftar, silakan gunakan email lain", nil)
			return
		}
	}

	user.Name = req.Name
	user.Email = req.Email

	if err := h.userRepo.UpdateUser(user); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Gagal memperbarui profil", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Profil berhasil diperbarui", gin.H{
		"id":    user.ID,
		"name":  user.Name,
		"email": user.Email,
		"role":  user.Role,
	})
}
