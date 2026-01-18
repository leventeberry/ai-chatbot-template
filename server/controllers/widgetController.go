package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type WidgetSessionResponse struct {
	SessionID string `json:"session_id"`
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
