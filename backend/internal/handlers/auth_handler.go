package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"mastutik-api/internal/models"
	"mastutik-api/internal/repository"
	"mastutik-api/internal/services"
	"mastutik-api/pkg/utils"
)

type AuthHandler struct {
	authService services.AuthService
	userRepo    repository.UserRepository
}

func NewAuthHandler(authService services.AuthService, userRepo repository.UserRepository) *AuthHandler {
	return &AuthHandler{
		authService: authService,
		userRepo:    userRepo,
	}
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid input payload", err.Error())
		return
	}

	user, err := h.authService.RegisterUser(req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusConflict, err.Error(), nil)
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "User registered successfully", gin.H{
		"id":    user.ID,
		"email": user.Email,
		"role":  user.Role,
	})
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid input payload", err.Error())
		return
	}

	authResponse, err := h.authService.LoginUser(req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusUnauthorized, err.Error(), nil)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Login successful", authResponse)
}

func (h *AuthHandler) AdminLogin(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid input payload", err.Error())
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
