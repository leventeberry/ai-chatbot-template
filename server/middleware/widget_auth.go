package middleware

import (
	"net/http"
	"strings"

	"chatbot_api/tokens"

	"github.com/gin-gonic/gin"
)

// WidgetAuthMiddleware validates widget tokens and attaches tenant/widget context.
func WidgetAuthMiddleware(tokenService tokens.TokenService) gin.HandlerFunc {
	return func(c *gin.Context) {
		if tokenService == nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Token service not configured"})
			return
		}

		authHeader := c.GetHeader("Authorization")
		token := ""
		if authHeader != "" {
			if !strings.HasPrefix(authHeader, "Bearer ") {
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid Authorization header"})
				return
			}
			token = strings.TrimPrefix(authHeader, "Bearer ")
		}

		claims, err := tokenService.ValidateToken(token)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		c.Set("tenantId", claims.TenantID)
		c.Set("widgetId", claims.WidgetID)
		c.Next()
	}
}
