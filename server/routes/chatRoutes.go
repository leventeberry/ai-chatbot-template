package routes

import (
	"chatbot_api/container"
	"chatbot_api/controllers"
	"chatbot_api/middleware"

	"github.com/gin-gonic/gin"
)

// SetupChatRoutes registers widget chat endpoints under the provided router group.
func SetupChatRoutes(router *gin.RouterGroup, c *container.Container) {
	api := router.Group("")
	api.Use(middleware.WidgetAuthMiddleware(c.TokenService))
	api.Use(middleware.WidgetCORSMiddleware(c.WidgetRepository))
	api.POST("/widget/session", controllers.CreateWidgetSession())
	api.GET("/widget/config", controllers.GetWidgetConfig(c.WidgetRepository))
	api.GET("/chat/history", controllers.ChatHistory(c.ChatService))
	api.POST("/chat", controllers.SendChatMessage(c.ChatService))
}
