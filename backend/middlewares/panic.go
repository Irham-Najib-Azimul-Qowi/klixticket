package middlewares

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

// CustomPanicHandler intercepts panics, prevents crashes and exposes a JSON error instead
func CustomPanicHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				fmt.Printf("Critical Panic: %v\n", err)
				c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
					"success":    false,
					"message":    "Internal server error occurred",
					"error_code": "INTERNAL_ERROR",
				})
			}
		}()
		c.Next()
	}
}
