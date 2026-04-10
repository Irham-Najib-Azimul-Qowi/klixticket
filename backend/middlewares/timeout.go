package middlewares

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// RequestTimeoutMiddleware limits each request to 5 seconds
func RequestTimeoutMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(c.Request.Context(), 30*time.Second)
		defer cancel()

		c.Request = c.Request.WithContext(ctx)

		// Create a channel to catch when request finishes
		finish := make(chan struct{})
		go func() {
			c.Next()
			finish <- struct{}{}
		}()

		select {
		case <-finish:
			return
		case <-ctx.Done():
			c.AbortWithStatusJSON(http.StatusGatewayTimeout, gin.H{
				"success":    false,
				"message":    "Request timeout exceeded",
				"error_code": "TIMEOUT_ERROR",
			})
			return
		}
	}
}
