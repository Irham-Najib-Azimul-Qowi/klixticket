package controllers

import (
	"encoding/json"
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"

	"mastutik-api/dto"
	"mastutik-api/pkg/utils"
)

func parseOptionalBool(value string) (*bool, error) {
	value = strings.TrimSpace(value)
	if value == "" {
		return nil, nil
	}

	parsed, err := strconv.ParseBool(value)
	if err != nil {
		return nil, err
	}

	return &parsed, nil
}

func parseRequiredFloat(value string) (float64, error) {
	return strconv.ParseFloat(strings.TrimSpace(value), 64)
}

func parseRequiredInt(value string) (int, error) {
	return strconv.Atoi(strings.TrimSpace(value))
}

func parseRequiredTime(value string) (time.Time, error) {
	return time.Parse(time.RFC3339Nano, strings.TrimSpace(value))
}

func validateStructPayload(payload any) error {
	return binding.Validator.ValidateStruct(payload)
}

func bindCreateEventRequest(c *gin.Context) (dto.CreateEventRequest, bool, error) {
	var req dto.CreateEventRequest

	if strings.HasPrefix(c.ContentType(), "multipart/form-data") {
		startDate, err := parseRequiredTime(c.PostForm("start_date"))
		if err != nil {
			return req, false, fmt.Errorf("invalid start_date: %w", err)
		}

		endDate, err := parseRequiredTime(c.PostForm("end_date"))
		if err != nil {
			return req, false, fmt.Errorf("invalid end_date: %w", err)
		}

		ticketTypes := make([]dto.CreateTicketRequest, 0)
		if err := json.Unmarshal([]byte(c.PostForm("ticket_types")), &ticketTypes); err != nil {
			return req, false, fmt.Errorf("invalid ticket_types: %w", err)
		}

		lineup := make([]dto.LineupItemRequest, 0)
		rawLineup := c.PostForm("lineup")
		if rawLineup != "" {
			if err := json.Unmarshal([]byte(rawLineup), &lineup); err != nil {
				return req, false, fmt.Errorf("invalid lineup: %w", err)
			}
		}

		// Handle Lineup Images
		for i := range lineup {
			fieldName := fmt.Sprintf("lineup_image_%d", i)
			artistImageURL, err := utils.SaveUploadedImage(c, fieldName, "lineup")
			if err != nil {
				return req, false, fmt.Errorf("failed to save lineup image %d: %w", i, err)
			}
			if artistImageURL != nil {
				lineup[i].ImageURL = artistImageURL
			}
		}

		bannerURL, err := utils.SaveUploadedImage(c, "banner", "events")
		if err != nil {
			return req, false, err
		}
		bannerUploaded := bannerURL != nil
		if bannerURL == nil {
			formBannerURL := strings.TrimSpace(c.PostForm("banner_url"))
			if formBannerURL != "" {
				bannerURL = &formBannerURL
			}
		}

		req = dto.CreateEventRequest{
			Title:         strings.TrimSpace(c.PostForm("title")),
			Description:   strings.TrimSpace(c.PostForm("description")),
			Location:      strings.TrimSpace(c.PostForm("location")),
			StartDate:     startDate,
			EndDate:       endDate,
			BannerURL:     bannerURL,
			PublishStatus: strings.TrimSpace(c.PostForm("publish_status")),
			TicketTypes:   ticketTypes,
			Lineup:        lineup,
		}

		if err := validateStructPayload(&req); err != nil {
			return req, bannerUploaded, err
		}

		return req, bannerUploaded, nil
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		return req, false, err
	}

	return req, false, nil
}

func bindUpdateEventRequest(c *gin.Context) (dto.UpdateEventRequest, bool, error) {
	var req dto.UpdateEventRequest

	if strings.HasPrefix(c.ContentType(), "multipart/form-data") {
		startDate, err := parseRequiredTime(c.PostForm("start_date"))
		if err != nil {
			return req, false, fmt.Errorf("invalid start_date: %w", err)
		}

		endDate, err := parseRequiredTime(c.PostForm("end_date"))
		if err != nil {
			return req, false, fmt.Errorf("invalid end_date: %w", err)
		}

		var ticketTypes *[]dto.UpsertTicketRequest
		rawTicketTypes := strings.TrimSpace(c.PostForm("ticket_types"))
		if rawTicketTypes != "" {
			parsed := make([]dto.UpsertTicketRequest, 0)
			if err := json.Unmarshal([]byte(rawTicketTypes), &parsed); err != nil {
				return req, false, fmt.Errorf("invalid ticket_types: %w", err)
			}
			ticketTypes = &parsed
		}

		var lineup *[]dto.UpsertLineupRequest
		rawLineup := strings.TrimSpace(c.PostForm("lineup"))
		if rawLineup != "" {
			parsed := make([]dto.UpsertLineupRequest, 0)
			if err := json.Unmarshal([]byte(rawLineup), &parsed); err != nil {
				return req, false, fmt.Errorf("invalid lineup: %w", err)
			}
			lineup = &parsed

			// Handle Lineup Images for Updates
			for i := range *lineup {
				fieldName := fmt.Sprintf("lineup_image_%d", i)
				artistImageURL, err := utils.SaveUploadedImage(c, fieldName, "lineup")
				if err != nil {
					return req, false, fmt.Errorf("failed to save lineup image %d: %w", i, err)
				}
				if artistImageURL != nil {
					(*lineup)[i].ImageURL = artistImageURL
				}
			}
		}

		bannerURL, err := utils.SaveUploadedImage(c, "banner", "events")
		if err != nil {
			return req, false, err
		}
		bannerUploaded := bannerURL != nil
		if bannerURL == nil {
			formBannerURL := strings.TrimSpace(c.PostForm("banner_url"))
			if formBannerURL != "" {
				bannerURL = &formBannerURL
			}
		}

		req = dto.UpdateEventRequest{
			Title:         strings.TrimSpace(c.PostForm("title")),
			Description:   strings.TrimSpace(c.PostForm("description")),
			Location:      strings.TrimSpace(c.PostForm("location")),
			StartDate:     startDate,
			EndDate:       endDate,
			BannerURL:     bannerURL,
			PublishStatus: strings.TrimSpace(c.PostForm("publish_status")),
			TicketTypes:   ticketTypes,
			Lineup:        lineup,
		}

		if err := validateStructPayload(&req); err != nil {
			return req, bannerUploaded, err
		}

		return req, bannerUploaded, nil
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		return req, false, err
	}

	return req, false, nil
}

func bindCreateMerchandiseRequest(c *gin.Context) (dto.CreateMerchandiseRequest, bool, error) {
	var req dto.CreateMerchandiseRequest

	if strings.HasPrefix(c.ContentType(), "multipart/form-data") {
		price, err := parseRequiredFloat(c.PostForm("price"))
		if err != nil {
			return req, false, fmt.Errorf("invalid price: %w", err)
		}

		stock, err := parseRequiredInt(c.PostForm("stock"))
		if err != nil {
			return req, false, fmt.Errorf("invalid stock: %w", err)
		}

		activeStatus, err := parseOptionalBool(c.PostForm("active_status"))
		if err != nil {
			return req, false, fmt.Errorf("invalid active_status: %w", err)
		}

		imageURL, err := utils.SaveUploadedImage(c, "image", "merchandise")
		if err != nil {
			return req, false, err
		}
		imageUploaded := imageURL != nil
		if imageURL == nil {
			formImageURL := strings.TrimSpace(c.PostForm("image_url"))
			if formImageURL != "" {
				imageURL = &formImageURL
			}
		}

		req = dto.CreateMerchandiseRequest{
			Name:         strings.TrimSpace(c.PostForm("name")),
			Description:  strings.TrimSpace(c.PostForm("description")),
			Price:        price,
			Stock:        &stock,
			ImageURL:     imageURL,
			ActiveStatus: activeStatus,
		}

		if err := validateStructPayload(&req); err != nil {
			return req, imageUploaded, err
		}

		return req, imageUploaded, nil
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		return req, false, err
	}

	return req, false, nil
}

func bindUpdateMerchandiseRequest(c *gin.Context) (dto.UpdateMerchandiseRequest, bool, error) {
	var req dto.UpdateMerchandiseRequest

	if strings.HasPrefix(c.ContentType(), "multipart/form-data") {
		price, err := parseRequiredFloat(c.PostForm("price"))
		if err != nil {
			return req, false, fmt.Errorf("invalid price: %w", err)
		}

		stock, err := parseRequiredInt(c.PostForm("stock"))
		if err != nil {
			return req, false, fmt.Errorf("invalid stock: %w", err)
		}

		activeStatus, err := parseOptionalBool(c.PostForm("active_status"))
		if err != nil {
			return req, false, fmt.Errorf("invalid active_status: %w", err)
		}
		if activeStatus == nil {
			return req, false, errors.New("active_status is required")
		}

		imageURL, err := utils.SaveUploadedImage(c, "image", "merchandise")
		if err != nil {
			return req, false, err
		}
		imageUploaded := imageURL != nil
		if imageURL == nil {
			formImageURL := strings.TrimSpace(c.PostForm("image_url"))
			if formImageURL != "" {
				imageURL = &formImageURL
			}
		}

		req = dto.UpdateMerchandiseRequest{
			Name:         strings.TrimSpace(c.PostForm("name")),
			Description:  strings.TrimSpace(c.PostForm("description")),
			Price:        price,
			Stock:        &stock,
			ImageURL:     imageURL,
			ActiveStatus: activeStatus,
		}

		if err := validateStructPayload(&req); err != nil {
			return req, imageUploaded, err
		}

		return req, imageUploaded, nil
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		return req, false, err
	}

	return req, false, nil
}
