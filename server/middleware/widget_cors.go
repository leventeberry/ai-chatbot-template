package middleware

import (
	"encoding/json"
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

		allowedOrigins := resolveAllowedOrigins(c, widgetRepo)
		if len(allowedOrigins) == 0 {
			c.Header("Access-Control-Allow-Origin", origin)
			c.Next()
			return
		}

		if !originAllowed(origin, allowedOrigins) {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Origin not allowed"})
			return
		}

		c.Header("Access-Control-Allow-Origin", origin)
		c.Header("Vary", "Origin")
		c.Next()
	}
}

func resolveAllowedOrigins(c *gin.Context, widgetRepo repositories.WidgetRepository) []string {
	if widgetRepo != nil {
		if widgetID, ok := c.Get("widgetId"); ok {
			if widgetIDStr, ok := widgetID.(string); ok && widgetIDStr != "" {
				widget, err := widgetRepo.FindByID(widgetIDStr)
				if err == nil {
					return parseOrigins(widget.AllowedOrigins)
				}
			}
		}
	}

	return parseOrigins(os.Getenv("CORS_ALLOW_ORIGINS"))
}

func originAllowed(origin string, allowed []string) bool {
	for _, candidate := range allowed {
		if origin == candidate {
			return true
		}
	}
	return false
}

func parseOrigins(raw string) []string {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return nil
	}

	if strings.HasPrefix(trimmed, "[") {
		var parsed []string
		if err := json.Unmarshal([]byte(trimmed), &parsed); err == nil {
			return normalizeOrigins(parsed)
		}
	}

	parts := strings.Split(trimmed, ",")
	return normalizeOrigins(parts)
}

func normalizeOrigins(origins []string) []string {
	result := make([]string, 0, len(origins))
	for _, origin := range origins {
		value := strings.TrimSpace(origin)
		if value != "" {
			result = append(result, value)
		}
	}
	return result
}
