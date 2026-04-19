package controllers

import (
	"mastutik-api/dto"
	"mastutik-api/pkg/response"
	"mastutik-api/services"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type TaxHandler struct {
	service services.TaxService
}

func NewTaxHandler(service services.TaxService) *TaxHandler {
	return &TaxHandler{service: service}
}

func (h *TaxHandler) CreateTax(c *gin.Context) {
	var req dto.CreateTaxRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}

	tax, err := h.service.CreateTax(c.Request.Context(), req)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to create tax", err.Error())
		return
	}

	response.Success(c, http.StatusCreated, "Tax created successfully", tax)
}

func (h *TaxHandler) GetAllTaxes(c *gin.Context) {
	taxes, err := h.service.GetAllTaxes(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to fetch taxes", err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Taxes fetched successfully", taxes)
}

func (h *TaxHandler) GetActiveTaxes(c *gin.Context) {
	taxes, err := h.service.GetActiveTaxes(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to fetch active taxes", err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Active taxes fetched successfully", taxes)
}

func (h *TaxHandler) UpdateTax(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID", err.Error())
		return
	}

	var req dto.UpdateTaxRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}

	tax, err := h.service.UpdateTax(c.Request.Context(), uint(id), req)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to update tax", err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Tax updated successfully", tax)
}

func (h *TaxHandler) DeleteTax(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID", err.Error())
		return
	}

	err = h.service.DeleteTax(c.Request.Context(), uint(id))
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to delete tax", err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Tax deleted successfully", nil)
}
