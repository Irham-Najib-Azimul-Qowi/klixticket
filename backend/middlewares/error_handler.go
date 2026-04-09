package middlewares

import (
	"log"
	"net/http"
	"runtime/debug"

	"github.com/gin-gonic/gin"
	"mastutik-api/pkg/utils"
)

// GlobalErrorHandler handles all panics and system errors gracefully
func GlobalErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				// Log the full stack trace for debugging on server-side
				log.Printf("[RECOVERY] Panic recovered: %v\nStack Trace:\n%s", err, debug.Stack())

				// Map technical error messages to user-friendly ones
				message := "Terjadi kesalahan internal pada server"
				
				// Optional: In production, never leak the actual 'err' content to the client
				utils.ErrorResponse(c, http.StatusInternalServerError, message, nil)
				c.Abort()
			}
		}()

		c.Next()

		// Handle errors that were added via c.Error(err)
		if len(c.Errors) > 0 {
			lastError := c.Errors.Last().Err
			log.Printf("[GIN ERROR] %v", lastError)

			// If response not yet written, send standard error
			if !c.Writer.Written() {
				utils.ErrorResponse(c, http.StatusInternalServerError, "Terjadi kesalahan pada sistem", nil)
			}
		}
	}
}
