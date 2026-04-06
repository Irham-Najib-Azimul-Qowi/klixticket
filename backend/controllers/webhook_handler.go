package controllers

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"

	"mastutik-api/dto"
	"mastutik-api/services"
	"mastutik-api/pkg/utils"
)

type WebhookHandler struct {
	orderService services.OrderService
}

func NewWebhookHandler(orderService services.OrderService) *WebhookHandler {
	return &WebhookHandler{orderService: orderService}
}

func (h *WebhookHandler) XenditCallback(c *gin.Context) {
	callbackToken := c.GetHeader("x-callback-token")
	expectedToken := os.Getenv("XENDIT_WEBHOOK_TOKEN")

	if expectedToken != "" && callbackToken != expectedToken {
		log.Println("Unauthorized webhook attempt")
		utils.ErrorResponse(c, http.StatusUnauthorized, "Unauthorized Webhook Call", nil)
		return
	}

	rawPayload, err := c.GetRawData()
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid Payload", nil)
		return
	}

	var payload dto.XenditWebhookRequest
	if err := json.Unmarshal(rawPayload, &payload); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid Payload", nil)
		return
	}

	log.Printf("Received Webhook from Xendit! OrderID: %s | Status: %s\n", payload.ExternalID, payload.Status)

	if err := h.orderService.ProcessXenditWebhook(c.Request.Context(), payload, string(rawPayload)); err != nil {
		if errors.Is(err, services.ErrWebhookAlreadyHandled) {
			utils.SuccessResponse(c, http.StatusOK, "Webhook already processed", nil)
			return
		}
		if errors.Is(err, services.ErrOrderNotFound) {
			utils.SuccessResponse(c, http.StatusOK, "Order Not Found", nil)
			return
		}

		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to process webhook", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Webhook processed", nil)
}
