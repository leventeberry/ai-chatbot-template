package middleware

import (
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
)

// AdminAuthMiddleware protects admin provisioning endpoints with a static token.
func AdminAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		expected := strings.TrimSpace(os.Getenv("ADMIN_TOKEN"))
		if expected == "" {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "admin token not configured"})
			return
		}

		provided := strings.TrimSpace(c.GetHeader("X-Admin-Token"))
		if provided == "" || provided != expected {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid admin token"})
			return
		}

		c.Next()
	}
}
