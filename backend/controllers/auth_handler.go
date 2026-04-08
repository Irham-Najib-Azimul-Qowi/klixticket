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

	token, err := h.authService.LoginUser(models.LoginRequest{
		Email:    req.Email,
		Password: req.Password,
	})
	if err != nil {
		// If auto-login fails for some reason, just return user without token
		utils.SuccessResponse(c, http.StatusCreated, "User registered successfully", gin.H{
			"user": user,
		})
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "User registered successfully", gin.H{
		"token": token.Token,
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

	// Menggunakan Updates untuk menjamin field terupdate dengan benar
	if err := h.userRepo.UpdateUser(user); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Gagal memperbarui profil", err.Error())
		return
	}

	// Kembalikan objek user lengkap (tanpa password) agar frontend mendapatkan data terbaru termasuk avatar_url
	utils.SuccessResponse(c, http.StatusOK, "Profil berhasil diperbarui", user)
}

func (h *AuthHandler) ForgotPassword(c *gin.Context) {
	var req models.ForgotPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Input tidak valid", utils.FormatValidationError(err))
		return
	}

	token, err := h.authService.RequestPasswordReset(req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Gagal memproses permintaan reset password", err.Error())
		return
	}

	// Security: Always return success message even if email not found
	// In production, we'd send it via email.
	// We log it for now since we haven't implemented real email sending yet
	if token != "" {
		// Log the token/link for development purposes
		println("DEBUG Reset Password Link: http://localhost:5173/reset-password?token=" + token)
	}

	utils.SuccessResponse(c, http.StatusOK, "Jika email terdaftar, instruksi reset password telah dikirim.", nil)
}

func (h *AuthHandler) ResetPassword(c *gin.Context) {
	var req models.ResetPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Input tidak valid", utils.FormatValidationError(err))
		return
	}

	if err := h.authService.ResetPassword(req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error(), nil)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Password berhasil direset, silakan login kembali.", nil)
}

func (h *AuthHandler) ChangePassword(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Unauthorized", nil)
		return
	}

	var req models.ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Input tidak valid", utils.FormatValidationError(err))
		return
	}

	if err := h.authService.ChangePassword(userID.(uint), req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error(), nil)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Password berhasil diubah", nil)
}
