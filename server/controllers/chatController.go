package controllers

import (
	"context"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/leventeberry/goapi/services"
)

type ChatRequest struct {
	Message string `json:"message"`
}

type ChatResponse struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

// ChatHistory returns chat history for the current widget session.
// @Summary      Chat history
// @Description  Returns in-memory chat history for the widget
// @Tags         chat
// @Accept       json
// @Produce      json
// @Success      200  {array}   ChatResponse
// @Router       /api/chat/history [get]
func ChatHistory(chatService services.ChatService) gin.HandlerFunc {
	return func(c *gin.Context) {
		history := chatService.GetHistory(c.Request.Context())
		c.JSON(http.StatusOK, history)
	}
}

// SendChatMessage sends a user message and returns the assistant response.
// @Summary      Send chat message
// @Description  Sends a message to the AI and returns the response
// @Tags         chat
// @Accept       json
// @Produce      json
// @Param        request  body      ChatRequest  true  "Chat message"
// @Success      200      {object}  ChatResponse
// @Failure      400      {object}  map[string]string
// @Router       /api/chat [post]
func SendChatMessage(chatService services.ChatService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input ChatRequest
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
			return
		}

		if strings.TrimSpace(input.Message) == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Message is required"})
			return
		}

		ctx, cancel := timeLimitedContext(c, 60*time.Second)
		defer cancel()

		resp := chatService.SendMessage(ctx, input.Message)
		c.JSON(http.StatusOK, resp)
	}
}

func timeLimitedContext(c *gin.Context, timeout time.Duration) (context.Context, context.CancelFunc) {
	return context.WithTimeout(c.Request.Context(), timeout)
}
