package utils

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type Response struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data      interface{} `json:"data,omitempty"`
	ErrorCode string      `json:"error_code,omitempty"`
	Errors    interface{} `json:"errors,omitempty"`
}

func SuccessResponse(c *gin.Context, statusCode int, message string, data interface{}) {
	c.JSON(statusCode, Response{
		Success: true,
		Message: message,
		Data:    data,
		Errors:  nil,
	})
}

func ErrorResponse(c *gin.Context, statusCode int, message string, errors interface{}) {
	errorCode := "INTERNAL_ERROR"
	if errStr, ok := errors.(string); ok {
		errorCode = errStr
		errors = nil
	} else if statusCode == http.StatusBadRequest {
		errorCode = "VALIDATION_ERROR"
	} else if statusCode == http.StatusUnauthorized {
		errorCode = "UNAUTHORIZED"
	} else if statusCode == http.StatusNotFound {
		errorCode = "NOT_FOUND"
	}

	c.JSON(statusCode, Response{
		Success:   false,
		Message:   message,
		Data:      nil,
		ErrorCode: errorCode,
		Errors:    errors,
	})
}
