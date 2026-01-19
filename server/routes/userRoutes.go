package routes

import (
	"github.com/gin-gonic/gin"
	"chatbot_api/container"
	"chatbot_api/controllers"
	"chatbot_api/middleware"
)

// SetupUserRoutes registers all user-related routes on the provided Gin router group
// All user routes are protected by authentication middleware
// Admin-only routes use RequireRole middleware for role-based access control
// Uses dependency injection container for all dependencies
// Accepts a *gin.RouterGroup to support versioned routes (e.g., /api/v1)
func SetupUserRoutes(router *gin.RouterGroup, c *container.Container) {
	// User routes group with authentication middleware
	userGroup := router.Group("/users")
	userGroup.Use(middleware.AuthMiddleware())
	{
		// Public authenticated routes (any authenticated user can access)
		userGroup.GET("", middleware.RequireRole("admin"), controllers.GetUsers(c.UserService))
		userGroup.GET("/:id", middleware.RequireSelfOrAdmin("id"), controllers.GetUser(c.UserService))
		userGroup.POST("", middleware.RequireRole("admin"), controllers.CreateUser(c.UserService))
		userGroup.PUT("/:id", middleware.RequireSelfOrAdmin("id"), controllers.UpdateUser(c.UserService))

		// Admin-only routes (require admin role)
		userGroup.DELETE("/:id", middleware.RequireRole("admin"), controllers.DeleteUser(c.UserService))
	}
}
