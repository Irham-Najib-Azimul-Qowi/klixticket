package controllers

import (
	"net/http"
	"os"
	"strings"

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

// sanitizeError prevents technical details from leaking to the UI
func (h *AuthHandler) sanitizeError(err error) string {
	msg := err.Error()

	// Map technical errors to user-friendly messages
	switch msg {
	case "invalid email or password":
		return "Email atau password salah"
	case "email already structured / registered":
		return "Email sudah terdaftar. Silakan gunakan email lain atau login kembali."
	case "invalid google token":
		return "Sesi Google telah berakhir, silakan login kembali"
	case "google login temporarily unavailable":
		return "Layanan Google sedang tidak tersedia"
	case "unauthorized: you do not have admin privileges":
		return "Anda tidak memiliki akses admin"
	case "user not found":
		return "Pengguna tidak ditemukan"
	case "password harus minimal 8 karakter dan mengandung kombinasi huruf serta angka":
		return "Password minimal 8 karakter dengan kombinasi huruf dan angka."
	case "password lama tidak sesuai":
		return "Password lama tidak sesuai"
	}

	// Catch-all for internal/system errors to avoid leakage
	// But allow key validation messages even if they are long
	if strings.Contains(msg, "password") || strings.Contains(msg, "karakter") || strings.Contains(msg, "kombinasi") {
		return msg
	}

	if len(msg) > 100 || (msg != "" && (strings.HasPrefix(msg, "JWT") || strings.HasPrefix(msg, "env") || strings.HasPrefix(msg, "dial tcp"))) {
		// If it looks like a technical system error (very long, JWT issues, connection errors)
		return "Terjadi kesalahan pada sistem, silakan coba beberapa saat lagi"
	}

	return msg
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Input tidak valid", utils.FormatValidationError(err))
		return
	}

	user, err := h.authService.RegisterUser(req)
	if err != nil {
		statusCode := http.StatusInternalServerError
		if err.Error() == "email already structured / registered" {
			statusCode = http.StatusConflict
		} else if err.Error() == "password harus minimal 8 karakter dan mengandung kombinasi huruf serta angka" {
			statusCode = http.StatusBadRequest
		}
		utils.ErrorResponse(c, statusCode, h.sanitizeError(err), nil)
		return
	}

	token, err := h.authService.LoginUser(models.LoginRequest{
		Email:    req.Email,
		Password: req.Password,
	})
	if err != nil {
		utils.SuccessResponse(c, http.StatusCreated, "User registered successfully", gin.H{
			"user": user,
		})
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "User registered successfully", gin.H{
		"token": token.Token,
		"user": gin.H{
			"id":    user.ID,
			"uuid":  user.UUID,
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
		utils.ErrorResponse(c, http.StatusUnauthorized, h.sanitizeError(err), nil)
		return
	}

	user, _ := h.userRepo.FindByEmail(req.Email)
	utils.SuccessResponse(c, http.StatusOK, "Login successful", gin.H{
		"token": authResponse.Token,
		"role":  authResponse.Role,
		"user": gin.H{
			"id":    user.ID,
			"uuid":  user.UUID,
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
		utils.ErrorResponse(c, http.StatusUnauthorized, h.sanitizeError(err), nil)
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
		utils.ErrorResponse(c, http.StatusUnauthorized, h.sanitizeError(err), nil)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Google Login successful", authResponse)
}

func (h *AuthHandler) GetMe(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Sesi tidak valid", nil)
		return
	}

	user, err := h.userRepo.FindByID(userID.(uint))
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Pengguna tidak ditemukan", nil)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "User profile retrieved", gin.H{
		"id":    user.ID,
		"uuid":  user.UUID,
		"name":  user.Name,
		"email": user.Email,
		"role":  user.Role,
	})
}

func (h *AuthHandler) UpdateMe(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Sesi tidak valid", nil)
		return
	}

	var req models.UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Input tidak valid", utils.FormatValidationError(err))
		return
	}

	user, err := h.userRepo.FindByID(userID.(uint))
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Pengguna tidak ditemukan", nil)
		return
	}

	if req.Email != user.Email {
		if existingUser, _ := h.userRepo.FindByEmail(req.Email); existingUser.ID != 0 {
			utils.ErrorResponse(c, http.StatusConflict, "Email sudah terdaftar", nil)
			return
		}
	}

	user.Name = req.Name
	user.Email = req.Email

	if err := h.userRepo.UpdateUser(user); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Gagal memperbarui profil", nil)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Profil berhasil diperbarui", user)
}

func (h *AuthHandler) ForgotPassword(c *gin.Context) {
	var req models.ForgotPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Input tidak valid", nil)
		return
	}

	token, err := h.authService.RequestPasswordReset(req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Gagal memproses permintaan", nil)
		return
	}

	if token != "" && os.Getenv("APP_ENV") != "production" {
		println("DEBUG Reset Password Link: http://localhost:5173/reset-password?token=" + token)
	}

	utils.SuccessResponse(c, http.StatusOK, "Jika email terdaftar, instruksi reset password telah dikirim.", nil)
}

func (h *AuthHandler) ResetPassword(c *gin.Context) {
	var req models.ResetPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Input tidak valid", nil)
		return
	}

	if err := h.authService.ResetPassword(req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, h.sanitizeError(err), nil)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Password berhasil direset, silakan login kembali.", nil)
}

func (h *AuthHandler) ChangePassword(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Sesi tidak valid", nil)
		return
	}

	var req models.ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Input tidak valid", nil)
		return
	}

	if err := h.authService.ChangePassword(userID.(uint), req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, h.sanitizeError(err), nil)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Password berhasil diubah", nil)
}
