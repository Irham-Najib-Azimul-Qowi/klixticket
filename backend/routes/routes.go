package routes

import "github.com/gin-gonic/gin"

// Deprecated: route registration lives in main.go so middleware wiring and
// dependency injection remain in one source of truth.
func SetupRoutes(_ *gin.Engine) {}
