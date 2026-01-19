package routes

import (
	"context"
	"net/http"
	"os"
	"time"

	"chatbot_api/container"
	"chatbot_api/controllers"
	"chatbot_api/middleware"

	"github.com/gin-gonic/gin"
)

// SetupRoutes registers all application routes on the provided Gin engine
// Uses dependency injection container for all dependencies
func SetupRoutes(router *gin.Engine, c *container.Container) {
	// Home / welcome message
	// @Summary      Welcome message
	// @Description  Returns API welcome message
	// @Tags         health
	// @Accept       json
	// @Produce      json
	// @Success      200  {object}  map[string]interface{}  "API is running"
	// @Router       / [get]
	router.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "Welcome!",
			"status":  http.StatusOK,
		})
	})

	// Liveness endpoint
	// @Summary      Liveness check
	// @Description  Basic liveness endpoint used for container checks
	// @Tags         health
	// @Accept       json
	// @Produce      json
	// @Success      200  {object}  map[string]interface{}  "Service is alive"
	// @Router       /healthz [get]
	router.GET("/healthz", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":    "alive",
			"timestamp": time.Now().Unix(),
		})
	})

	// Readiness endpoint
	// @Summary      Readiness check
	// @Description  Verifies database and Redis connectivity before accepting traffic
	// @Tags         health
	// @Accept       json
	// @Produce      json
	// @Success      200  {object}  map[string]interface{}  "All systems ready"
	// @Failure      503  {object}  map[string]interface{}  "Service unavailable"
	// @Router       /readyz [get]
	router.GET("/readyz", healthCheckHandler(c))

	// Backwards-compatible health endpoint
	router.GET("/health", healthCheckHandler(c))

	// Widget chat endpoints
	SetupChatRoutes(router, c)

	if c.DB != nil {
		admin := router.Group("/api/admin")
		admin.Use(middleware.AdminAuthMiddleware())
		{
			admin.POST("/tenants", controllers.CreateTenant(c.TenantRepository))
			admin.POST("/widgets", controllers.CreateWidget(c.WidgetRepository))
			admin.GET("/widgets/:id", controllers.GetWidget(c.WidgetRepository))
			admin.PATCH("/widgets/:id", controllers.UpdateWidget(c.WidgetRepository))
			admin.POST("/widgets/:id/tokens", controllers.CreateWidgetToken(c.WidgetRepository, c.ApiKeyRepository))
			admin.GET("/widgets/:id/tokens", controllers.ListWidgetTokens(c.ApiKeyRepository))
			admin.POST("/widgets/:id/tokens/rotate", controllers.RotateWidgetTokens(c.WidgetRepository, c.ApiKeyRepository))
			admin.DELETE("/widgets/:id/tokens/:tokenId", controllers.RevokeWidgetToken(c.ApiKeyRepository))
		}
	}

	// API v1 routes group
	// All API endpoints are versioned under /api/v1 for backward compatibility
	if authEnabled() && c.AuthService != nil {
		v1 := router.Group("/api/v1")
		{
			// Authentication routes
			// @Summary      Login user
			// @Description  Authenticate a user with email and password, returns JWT token
			// @Tags         authentication
			// @Accept       json
			// @Produce      json
			// @Param        credentials  body      RequestUserInput  true  "Login credentials"
			// @Success      200          {object}  map[string]interface{}  "Login successful"
			// @Failure      400          {object}  map[string]string  "Invalid request"
			// @Failure      401          {object}  map[string]string  "Invalid credentials"
			// @Failure      500          {object}  map[string]string  "Server error"
			// @Router       /api/v1/login [post]
			v1.POST("/login", controllers.LoginUser(c.AuthService))

			// @Summary      Register new user
			// @Description  Create a new user account and receive JWT token
			// @Tags         authentication
			// @Accept       json
			// @Produce      json
			// @Param        user  body      SignupUserInput  true  "User registration data"
			// @Success      200   {object}  map[string]interface{}  "Registration successful"
			// @Failure      400   {object}  map[string]string  "Invalid request"
			// @Failure      409   {object}  map[string]string  "Email already registered"
			// @Failure      500   {object}  map[string]string  "Server error"
			// @Router       /api/v1/register [post]
			v1.POST("/register", controllers.SignupUser(c.AuthService))

			// User routes setup
			SetupUserRoutes(v1, c)
		}
	}

	if authEnabled() && c.AuthService != nil {
		dashboard := router.Group("/api/dashboard")
		dashboard.Use(middleware.AuthMiddleware())
		{
			widgetGroup := dashboard.Group("/widgets/:id")
			widgetGroup.Use(middleware.RequireWidgetMatch("id"))
			{
				widgetGroup.GET("", controllers.GetWidget(c.WidgetRepository))
				widgetGroup.PATCH("", controllers.UpdateWidget(c.WidgetRepository))
				widgetGroup.GET("/tokens", controllers.ListWidgetTokens(c.ApiKeyRepository))
				widgetGroup.POST("/tokens", controllers.CreateWidgetToken(c.WidgetRepository, c.ApiKeyRepository))
				widgetGroup.POST("/tokens/rotate", controllers.RotateWidgetTokens(c.WidgetRepository, c.ApiKeyRepository))
				widgetGroup.DELETE("/tokens/:tokenId", controllers.RevokeWidgetToken(c.ApiKeyRepository))
				widgetGroup.GET("/analytics", controllers.GetWidgetAnalytics(
					c.WidgetRepository,
					c.ConversationRepository,
					c.MessageRepository,
					c.ApiKeyRepository,
				))
				widgetGroup.GET("/conversations", controllers.ListWidgetConversations(c.ConversationRepository))
			}

			dashboard.GET("/conversations/:id/messages", controllers.GetConversationMessages(
				c.ConversationRepository,
				c.MessageRepository,
			))
		}
	}
}

// healthCheckHandler returns a handler function for the health check endpoint
func healthCheckHandler(container *container.Container) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		health := gin.H{
			"status":    "healthy",
			"timestamp": time.Now().Unix(),
		}

		// Check database connectivity
		if container.DB != nil {
			sqlDB, err := container.DB.DB()
			if err != nil {
				health["database"] = gin.H{"status": "unhealthy", "error": "failed to get database connection"}
				health["status"] = "unhealthy"
				c.JSON(http.StatusServiceUnavailable, health)
				return
			}

			if err := sqlDB.PingContext(ctx); err != nil {
				health["database"] = gin.H{"status": "unhealthy", "error": err.Error()}
				health["status"] = "unhealthy"
				c.JSON(http.StatusServiceUnavailable, health)
				return
			}

			health["database"] = gin.H{"status": "healthy"}
		} else {
			health["database"] = gin.H{"status": "disabled"}
		}

		// Check Redis/cache connectivity (if enabled)
		if container.Cache != nil {
			if err := container.Cache.Ping(ctx); err != nil {
				health["cache"] = gin.H{"status": "unhealthy", "error": err.Error()}
				// Cache is optional, so don't fail overall health if cache is down
				// but still report it in the response
			} else {
				health["cache"] = gin.H{"status": "healthy"}
			}
		} else {
			health["cache"] = gin.H{"status": "disabled"}
		}

		// Determine overall status code
		statusCode := http.StatusOK
		if health["status"] == "unhealthy" {
			statusCode = http.StatusServiceUnavailable
		}

		c.JSON(statusCode, health)
	}
}

func authEnabled() bool {
	value := os.Getenv("AUTH_ENABLED")
	return value == "" || value == "true"
}
