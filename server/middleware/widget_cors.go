package middleware

import (
	"net/http"
	"os"
	"strings"

	"chatbot_api/repositories"

	"github.com/gin-gonic/gin"
)

// WidgetCORSMiddleware restricts requests to widget-allowed origins.
func WidgetCORSMiddleware(widgetRepo repositories.WidgetRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := strings.TrimSpace(c.GetHeader("Origin"))
		if origin == "" {
			c.Next()
			return
		}

		allowedOrigin := resolveAllowedOrigin(c, widgetRepo)
		if allowedOrigin == "" {
			c.Header("Access-Control-Allow-Origin", origin)
			c.Next()
			return
		}

		if origin != allowedOrigin {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Origin not allowed"})
			return
		}

		c.Header("Access-Control-Allow-Origin", origin)
		c.Header("Vary", "Origin")
		c.Next()
	}
}

func resolveAllowedOrigin(c *gin.Context, widgetRepo repositories.WidgetRepository) string {
	if widgetRepo != nil {
		if widgetID, ok := c.Get("widgetId"); ok {
			if widgetIDStr, ok := widgetID.(string); ok && widgetIDStr != "" {
				widget, err := widgetRepo.FindByID(widgetIDStr)
				if err == nil {
					return normalizeAllowedOrigin(widget.AllowedOrigin)
				}
			}
		}
	}

	return normalizeAllowedOrigin(os.Getenv("CORS_ALLOW_ORIGIN"))
}

func normalizeAllowedOrigin(raw string) string {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return ""
	}

	return strings.Split(trimmed, ",")[0]
}
