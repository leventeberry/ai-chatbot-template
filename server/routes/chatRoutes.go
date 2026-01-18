package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/leventeberry/goapi/container"
	"github.com/leventeberry/goapi/controllers"
	"github.com/leventeberry/goapi/middleware"
)

// SetupChatRoutes registers widget chat endpoints under /api.
func SetupChatRoutes(router *gin.Engine, c *container.Container) {
	api := router.Group("/api")
	{
		api.Use(middleware.WidgetAuthMiddleware(c.TokenService))
		api.GET("/chat/history", controllers.ChatHistory(c.ChatService))
		api.POST("/chat", controllers.SendChatMessage(c.ChatService))
	}
}
