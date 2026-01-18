package routes

import (
	"chatbot_api/container"
	"chatbot_api/controllers"
	"chatbot_api/middleware"
	"github.com/gin-gonic/gin"
)

// SetupChatRoutes registers widget chat endpoints under /api.
func SetupChatRoutes(router *gin.Engine, c *container.Container) {
	api := router.Group("/api")
	{
		api.Use(middleware.WidgetAuthMiddleware(c.TokenService))
		api.Use(middleware.WidgetCORSMiddleware(c.WidgetRepository))
		api.POST("/widget/session", controllers.CreateWidgetSession())
		api.GET("/widget/config", controllers.GetWidgetConfig(c.WidgetRepository))
		api.GET("/chat/history", controllers.ChatHistory(c.ChatService))
		api.POST("/chat", controllers.SendChatMessage(c.ChatService))
	}
}
