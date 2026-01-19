package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// RequireWidgetMatch ensures the route param widget id matches JWT claims.
func RequireWidgetMatch(paramName string) gin.HandlerFunc {
	return func(c *gin.Context) {
		paramValue := strings.TrimSpace(c.Param(paramName))
		claimValue, _ := c.Get("widgetId")
		widgetID, _ := claimValue.(string)

		if paramValue == "" || widgetID == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "widget context missing"})
			return
		}
		if paramValue != widgetID {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "widget access denied"})
			return
		}
		c.Next()
	}
}
