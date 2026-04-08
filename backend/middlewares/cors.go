package middlewares

import (
	"os"
	"strings"

	"github.com/gin-gonic/gin"
)

func CORSMiddleware() gin.HandlerFunc {
	allowedOriginsMap := make(map[string]struct{})
	for _, origin := range strings.Split(os.Getenv("ALLOWED_ORIGINS"), ",") {
		trimmed := strings.TrimSpace(origin)
		if trimmed != "" {
			allowedOriginsMap[trimmed] = struct{}{}
		}
	}

	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")

		if _, exists := allowedOriginsMap[origin]; exists {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
		}

		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")
		c.Writer.Header().Set("Cross-Origin-Opener-Policy", "same-origin-allow-popups")
		c.Writer.Header().Set("Cross-Origin-Embedder-Policy", "unsafe-none")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
