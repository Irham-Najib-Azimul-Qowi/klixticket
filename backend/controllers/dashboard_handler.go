package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"mastutik-api/services"
	"mastutik-api/pkg/utils"
)

type DashboardHandler struct {
	service services.DashboardService
}

func NewDashboardHandler(service services.DashboardService) *DashboardHandler {
	return &DashboardHandler{service: service}
}

func (h *DashboardHandler) GetSummary(c *gin.Context) {
	summary, err := h.service.GetSummary(c.Request.Context())
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to retrieve dashboard summary", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Dashboard summary retrieved", summary)
}

func (h *DashboardHandler) GetSalesChart(c *gin.Context) {
	chart, err := h.service.GetSalesChart(c.Request.Context())
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to retrieve sales chart", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Sales chart retrieved", chart)
}
