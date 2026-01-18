package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"chatbot_api/repositories"
)

type WidgetSessionResponse struct {
	SessionID string `json:"session_id"`
}

type WidgetConfigResponse struct {
	ID             string `json:"id"`
	Name           string `json:"name"`
	AllowedOrigins string `json:"allowed_origins"`
	Config         string `json:"config"`
}

// CreateWidgetSession returns a new session identifier for a widget chat session.
// @Summary      Create widget session
// @Description  Creates a new chat session ID for the widget
// @Tags         chat
// @Accept       json
// @Produce      json
// @Success      200  {object}  WidgetSessionResponse
// @Router       /api/widget/session [post]
func CreateWidgetSession() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusOK, WidgetSessionResponse{
			SessionID: uuid.NewString(),
		})
	}
}

// GetWidgetConfig returns widget configuration metadata.
// @Summary      Widget config
// @Description  Returns the widget configuration for the authenticated widget
// @Tags         chat
// @Accept       json
// @Produce      json
// @Success      200  {object}  WidgetConfigResponse
// @Failure      401  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /api/widget/config [get]
func GetWidgetConfig(widgetRepo repositories.WidgetRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		if widgetRepo == nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Widget repository not configured"})
			return
		}

		widgetID, _ := c.Get("widgetId")
		widgetIDStr, _ := widgetID.(string)
		if widgetIDStr == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Widget context missing"})
			return
		}

		widget, err := widgetRepo.FindByID(widgetIDStr)
		if err != nil {
			handleServiceError(c, err)
			return
		}

		c.JSON(http.StatusOK, WidgetConfigResponse{
			ID:             widget.ID,
			Name:           widget.Name,
			AllowedOrigins: widget.AllowedOrigins,
			Config:         widget.Config,
		})
	}
}
