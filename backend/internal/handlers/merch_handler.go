package handlers

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"mastutik-api/internal/dto"
	"mastutik-api/internal/services"
	"mastutik-api/pkg/utils"
)

type MerchandiseHandler struct {
	service services.MerchandiseService
}

func NewMerchandiseHandler(service services.MerchandiseService) *MerchandiseHandler {
	return &MerchandiseHandler{service: service}
}

func (h *MerchandiseHandler) GetPublicMerchandise(c *gin.Context) {
	var query dto.MerchandiseListQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid query params", err.Error())
		return
	}

	merchandise, err := h.service.GetPublicMerchandise(c.Request.Context(), query)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to retrieve merchandise", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Merchandise retrieved successfully", merchandise)
}

func (h *MerchandiseHandler) GetAllMerchandiseAdmin(c *gin.Context) {
	var query dto.MerchandiseListQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid query params", err.Error())
		return
	}

	merchandise, err := h.service.GetAllMerchandise(c.Request.Context(), query)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to retrieve merchandise", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Admin merchandise retrieved successfully", merchandise)
}

func (h *MerchandiseHandler) GetMerchandiseByIDAdmin(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid merchandise ID", err.Error())
		return
	}

	merchandise, err := h.service.GetMerchandiseByID(c.Request.Context(), uint(id))
	if err != nil {
		if errors.Is(err, services.ErrMerchandiseNotFound) {
			utils.ErrorResponse(c, http.StatusNotFound, err.Error(), nil)
			return
		}

		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to retrieve merchandise", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Merchandise detail retrieved successfully", merchandise)
}

func (h *MerchandiseHandler) CreateMerchandise(c *gin.Context) {
	req, imageUploaded, err := bindCreateMerchandiseRequest(c)
	if err != nil {
		if imageUploaded {
			_ = utils.DeleteManagedUpload(req.ImageURL)
		}
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid input payload", err.Error())
		return
	}

	merchandise, err := h.service.CreateMerchandise(c.Request.Context(), req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create merchandise", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Merchandise created successfully", merchandise)
}

func (h *MerchandiseHandler) UpdateMerchandise(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid merchandise ID", err.Error())
		return
	}

	req, imageUploaded, err := bindUpdateMerchandiseRequest(c)
	if err != nil {
		if imageUploaded {
			_ = utils.DeleteManagedUpload(req.ImageURL)
		}
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid input payload", err.Error())
		return
	}

	merchandise, err := h.service.UpdateMerchandise(c.Request.Context(), uint(id), req)
	if err != nil {
		if errors.Is(err, services.ErrMerchandiseNotFound) {
			utils.ErrorResponse(c, http.StatusNotFound, err.Error(), nil)
			return
		}

		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to update merchandise", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Merchandise updated successfully", merchandise)
}

func (h *MerchandiseHandler) DeleteMerchandise(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid merchandise ID", err.Error())
		return
	}

	if err := h.service.DeleteMerchandise(c.Request.Context(), uint(id)); err != nil {
		if errors.Is(err, services.ErrMerchandiseNotFound) {
			utils.ErrorResponse(c, http.StatusNotFound, err.Error(), nil)
			return
		}

		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to delete merchandise", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Merchandise deleted successfully", nil)
}
