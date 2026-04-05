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

type EventHandler struct {
	service services.EventService
}

func NewEventHandler(service services.EventService) *EventHandler {
	return &EventHandler{service: service}
}

func handleEventServiceError(c *gin.Context, err error, fallbackMessage string) {
	switch {
	case errors.Is(err, services.ErrEventNotFound), errors.Is(err, services.ErrTicketTypeNotFound):
		utils.ErrorResponse(c, http.StatusNotFound, err.Error(), nil)
	case errors.Is(err, services.ErrInvalidEventDateRange),
		errors.Is(err, services.ErrInvalidTicketSalesRange),
		errors.Is(err, services.ErrTicketSalesExceedsEvent),
		errors.Is(err, services.ErrTicketSalesStartsAfterEvent),
		errors.Is(err, services.ErrDuplicateTicketName),
		errors.Is(err, services.ErrDuplicateTicketID),
		errors.Is(err, services.ErrEventEndBeforeExistingTicket),
		errors.Is(err, services.ErrTicketQuotaBelowSold),
		errors.Is(err, services.ErrCannotDeleteSoldTicket):
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error(), nil)
	case errors.Is(err, services.ErrTicketNotInEvent):
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error(), nil)
	default:
		utils.ErrorResponse(c, http.StatusInternalServerError, fallbackMessage, err.Error())
	}
}

func (h *EventHandler) GetPublishedEvents(c *gin.Context) {
	var query dto.EventListQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid query params", err.Error())
		return
	}

	events, err := h.service.GetPublishedEvents(c.Request.Context(), query)
	if err != nil {
		handleEventServiceError(c, err, "Failed to fetch events")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Published events retrieved", events)
}

func (h *EventHandler) GetPublishedEventByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid event ID", err.Error())
		return
	}

	event, err := h.service.GetPublishedEventByID(c.Request.Context(), uint(id))
	if err != nil {
		handleEventServiceError(c, err, "Failed to fetch event detail")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Event detail retrieved", event)
}

func (h *EventHandler) GetAllEventsAdmin(c *gin.Context) {
	var query dto.EventListQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid query params", err.Error())
		return
	}

	events, err := h.service.GetAllEvents(c.Request.Context(), query)
	if err != nil {
		handleEventServiceError(c, err, "Failed to fetch events")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "All events retrieved", events)
}

func (h *EventHandler) GetEventByIDAdmin(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid event ID", err.Error())
		return
	}

	event, err := h.service.GetEventByID(c.Request.Context(), uint(id))
	if err != nil {
		handleEventServiceError(c, err, "Failed to fetch event detail")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Event detail retrieved", event)
}

func (h *EventHandler) CreateEvent(c *gin.Context) {
	req, bannerUploaded, err := bindCreateEventRequest(c)
	if err != nil {
		if bannerUploaded {
			_ = utils.DeleteManagedUpload(req.BannerURL)
		}
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid input payload", err.Error())
		return
	}

	event, err := h.service.CreateEvent(c.Request.Context(), req)
	if err != nil {
		handleEventServiceError(c, err, "Failed to create event")
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Event created successfully", event)
}

func (h *EventHandler) UpdateEvent(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid event ID", err.Error())
		return
	}

	req, bannerUploaded, err := bindUpdateEventRequest(c)
	if err != nil {
		if bannerUploaded {
			_ = utils.DeleteManagedUpload(req.BannerURL)
		}
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid input payload", err.Error())
		return
	}

	event, err := h.service.UpdateEvent(c.Request.Context(), uint(id), req)
	if err != nil {
		handleEventServiceError(c, err, "Failed to update event")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Event updated successfully", event)
}

func (h *EventHandler) DeleteEvent(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid event ID", err.Error())
		return
	}

	if err := h.service.DeleteEvent(c.Request.Context(), uint(id)); err != nil {
		handleEventServiceError(c, err, "Failed to delete event")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Event deleted successfully", nil)
}

func (h *EventHandler) CreateTicket(c *gin.Context) {
	eventID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid event ID", err.Error())
		return
	}

	var req dto.CreateTicketRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid input payload", err.Error())
		return
	}

	ticket, err := h.service.CreateTicket(c.Request.Context(), uint(eventID), req)
	if err != nil {
		handleEventServiceError(c, err, "Failed to create ticket")
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Ticket created successfully", ticket)
}

func (h *EventHandler) UpdateTicketStatus(c *gin.Context) {
	ticketID, err := strconv.ParseUint(c.Param("ticket_id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid ticket ID", err.Error())
		return
	}

	var req dto.UpdateTicketRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid input payload", err.Error())
		return
	}

	ticket, err := h.service.UpdateTicketStatus(c.Request.Context(), uint(ticketID), req)
	if err != nil {
		handleEventServiceError(c, err, "Failed to update ticket status")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Ticket status updated successfully", ticket)
}

func (h *EventHandler) DeleteTicket(c *gin.Context) {
	ticketID, err := strconv.ParseUint(c.Param("ticket_id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid ticket ID", err.Error())
		return
	}

	if err := h.service.DeleteTicket(c.Request.Context(), uint(ticketID)); err != nil {
		handleEventServiceError(c, err, "Failed to delete ticket")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Ticket deleted successfully", nil)
}
