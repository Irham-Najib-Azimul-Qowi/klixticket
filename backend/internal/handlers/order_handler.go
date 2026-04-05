package handlers

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"

	"mastutik-api/internal/dto"
	"mastutik-api/internal/services"
	"mastutik-api/pkg/utils"
)

type OrderHandler struct {
	service services.OrderService
}

func NewOrderHandler(service services.OrderService) *OrderHandler {
	return &OrderHandler{service: service}
}

func handleOrderServiceError(c *gin.Context, err error, fallbackMessage string) {
	switch {
	case errors.Is(err, services.ErrOrderNotFound):
		utils.ErrorResponse(c, http.StatusNotFound, err.Error(), nil)
	case errors.Is(err, services.ErrOrderNotPaid),
		errors.Is(err, services.ErrOrderAlreadyCheckedIn),
		errors.Is(err, services.ErrOrderValidation),
		errors.Is(err, services.ErrOrderHasNoTicketItems):
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error(), nil)
	case errors.Is(err, services.ErrWebhookAlreadyHandled):
		utils.SuccessResponse(c, http.StatusOK, "Webhook already processed", nil)
	default:
		utils.ErrorResponse(c, http.StatusInternalServerError, fallbackMessage, err.Error())
	}
}

// ---- PUBLIC / USER ENDPOINTS ----

func (h *OrderHandler) CreateOrder(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Unauthorized", nil)
		return
	}

	var req dto.CreateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid input payload", err.Error())
		return
	}

	order, err := h.service.CreateOrder(c.Request.Context(), userID.(uint), req)
	if err != nil {
		handleOrderServiceError(c, err, "Failed to checkout order")
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Order created successfully", order)
}

func (h *OrderHandler) GetMyOrders(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Unauthorized", nil)
		return
	}

	var query dto.OrderListQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid query params", err.Error())
		return
	}

	orders, err := h.service.GetMyOrders(c.Request.Context(), userID.(uint), query)
	if err != nil {
		handleOrderServiceError(c, err, "Failed to retrieve orders")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Orders retrieved successfully", orders)
}

func (h *OrderHandler) GetOrderByID(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Unauthorized", nil)
		return
	}

	orderID := c.Param("id")
	if orderID == "" {
		utils.ErrorResponse(c, http.StatusBadRequest, "Order ID is required", nil)
		return
	}

	order, err := h.service.GetOrderByID(c.Request.Context(), orderID, userID.(uint))
	if err != nil {
		if err.Error() == "unauthorized: you do not own this order" {
			utils.ErrorResponse(c, http.StatusForbidden, err.Error(), nil)
			return
		}
		handleOrderServiceError(c, err, "Failed to retrieve order")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Order retrieved successfully", order)
}

// ---- ADMIN ENDPOINTS ----

func (h *OrderHandler) GetAllOrdersAdmin(c *gin.Context) {
	var query dto.OrderListQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid query params", err.Error())
		return
	}

	orders, err := h.service.GetAllOrdersAdmin(c.Request.Context(), query)
	if err != nil {
		handleOrderServiceError(c, err, "Failed to retrieve orders")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "All orders retrieved", orders)
}

func (h *OrderHandler) GetOrderByIDAdmin(c *gin.Context) {
	orderID := c.Param("id")
	if orderID == "" {
		utils.ErrorResponse(c, http.StatusBadRequest, "Order ID is required", nil)
		return
	}

	order, err := h.service.GetOrderByIDAdmin(c.Request.Context(), orderID)
	if err != nil {
		handleOrderServiceError(c, err, "Failed to retrieve order")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Order retrieved successfully", order)
}

func (h *OrderHandler) CheckInOrderAdmin(c *gin.Context) {
	adminUserID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Unauthorized", nil)
		return
	}

	orderID := c.Param("id")
	if orderID == "" {
		utils.ErrorResponse(c, http.StatusBadRequest, "Order ID is required", nil)
		return
	}

	order, err := h.service.CheckInOrder(c.Request.Context(), orderID, adminUserID.(uint))
	if err != nil {
		handleOrderServiceError(c, err, "Failed to check in order")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Order checked in successfully", order)
}
