package routes

import (
	"github.com/gin-gonic/gin"
	"chatbot_api/container"
	"chatbot_api/controllers"
	"chatbot_api/middleware"
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
