package controllers

import (
	"context"
	"net/http"
	"net/url"
	"strings"
	"time"

	"chatbot_api/services"
	"github.com/gin-gonic/gin"
)

type ChatRequest struct {
	Message   string `json:"message"`
	SessionID string `json:"session_id"`
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
// @Param        session_id  query     string  false  "Session identifier"
// @Success      200  {array}   ChatResponse
// @Router       /api/chat/history [get]
func ChatHistory(chatService services.ChatService) gin.HandlerFunc {
	return func(c *gin.Context) {
		tenantID, widgetID, ok := getWidgetContext(c)
		if !ok {
			return
		}

		sessionID := normalizeSessionID(c.Query("session_id"))
		history := chatService.GetHistory(c.Request.Context(), tenantID, widgetID, sessionID)
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
		tenantID, widgetID, ok := getWidgetContext(c)
		if !ok {
			return
		}

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

		sessionID := normalizeSessionID(input.SessionID)
		origin := resolveRequestOrigin(c)
		resp := chatService.SendMessage(ctx, tenantID, widgetID, sessionID, origin, input.Message)
		c.JSON(http.StatusOK, resp)
	}
}

func timeLimitedContext(c *gin.Context, timeout time.Duration) (context.Context, context.CancelFunc) {
	return context.WithTimeout(c.Request.Context(), timeout)
}

func getWidgetContext(c *gin.Context) (string, string, bool) {
	tenantValue, ok := c.Get("tenantId")
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "tenant context missing"})
		return "", "", false
	}
	widgetValue, ok := c.Get("widgetId")
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "widget context missing"})
		return "", "", false
	}

	tenantID, _ := tenantValue.(string)
	widgetID, _ := widgetValue.(string)
	if tenantID == "" || widgetID == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid widget context"})
		return "", "", false
	}

	return tenantID, widgetID, true
}

func normalizeSessionID(sessionID string) string {
	trimmed := strings.TrimSpace(sessionID)
	if trimmed == "" {
		return "default"
	}
	return trimmed
}

func resolveRequestOrigin(c *gin.Context) string {
	origin := strings.TrimSpace(c.GetHeader("Origin"))
	if origin != "" {
		return origin
	}

	referer := strings.TrimSpace(c.GetHeader("Referer"))
	if referer == "" {
		return ""
	}
	parsed, err := url.Parse(referer)
	if err != nil {
		return ""
	}
	return strings.TrimSpace(parsed.Scheme + "://" + parsed.Host)
}
