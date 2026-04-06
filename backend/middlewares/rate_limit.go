package middlewares

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"

	"mastutik-api/pkg/utils"
)

type rateLimitEntry struct {
	count      int
	windowEnds time.Time
}

type rateLimiter struct {
	mu      sync.Mutex
	entries map[string]rateLimitEntry
	limit   int
	window  time.Duration
}

func NewSimpleRateLimit(limit int, window time.Duration) gin.HandlerFunc {
	limiter := &rateLimiter{
		entries: make(map[string]rateLimitEntry),
		limit:   limit,
		window:  window,
	}

	return func(c *gin.Context) {
		key := c.ClientIP() + ":" + c.FullPath()
		now := time.Now()

		limiter.mu.Lock()
		entry, exists := limiter.entries[key]
		if !exists || now.After(entry.windowEnds) {
			entry = rateLimitEntry{
				count:      0,
				windowEnds: now.Add(limiter.window),
			}
		}

		entry.count++
		limiter.entries[key] = entry
		remaining := entry.windowEnds.Sub(now)
		limiter.mu.Unlock()

		if entry.count > limiter.limit {
			utils.ErrorResponse(c, http.StatusTooManyRequests, "Too many requests", gin.H{
				"retry_after_seconds": int(remaining.Seconds()) + 1,
			})
			c.Abort()
			return
		}

		c.Next()
	}
}
