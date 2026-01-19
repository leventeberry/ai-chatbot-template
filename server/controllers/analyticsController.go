package controllers

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"chatbot_api/repositories"
	"github.com/gin-gonic/gin"
)

type AnalyticsMessageCounts struct {
	Total     int64 `json:"total"`
	User      int64 `json:"user"`
	Assistant int64 `json:"assistant"`
}

type AnalyticsSessionCounts struct {
	Total int64 `json:"total"`
	Today int64 `json:"today"`
}

type AnalyticsTokenSummary struct {
	ID         string  `json:"id"`
	Name       string  `json:"name"`
	CreatedAt  string  `json:"created_at"`
	LastUsedAt *string `json:"last_used_at,omitempty"`
}

type AnalyticsOriginSummary struct {
	Origin   string `json:"origin"`
	Sessions int64  `json:"sessions"`
	Messages int64  `json:"messages"`
}

type WidgetAnalyticsResponse struct {
	WidgetID   string                  `json:"widget_id"`
	From       *string                 `json:"from,omitempty"`
	To         *string                 `json:"to,omitempty"`
	Messages   AnalyticsMessageCounts  `json:"messages"`
	Sessions   AnalyticsSessionCounts  `json:"sessions"`
	Tokens     []AnalyticsTokenSummary `json:"tokens"`
	LastChatAt *string                 `json:"last_chat_at,omitempty"`
	PerDomain  []AnalyticsOriginSummary `json:"per_domain"`
}

type ConversationSummaryResponse struct {
	ID           string `json:"id"`
	SessionID    string `json:"session_id"`
	Origin       string `json:"origin"`
	CreatedAt    string `json:"created_at"`
	MessageCount int64  `json:"message_count"`
}

type ConversationMessageResponse struct {
	ID        string `json:"id"`
	Role      string `json:"role"`
	Content   string `json:"content"`
	CreatedAt string `json:"created_at"`
}

func GetWidgetAnalytics(
	widgetRepo repositories.WidgetRepository,
	conversationRepo repositories.ConversationRepository,
	messageRepo repositories.MessageRepository,
	apiKeyRepo repositories.ApiKeyRepository,
) gin.HandlerFunc {
	return func(c *gin.Context) {
		widgetID := strings.TrimSpace(c.Param("id"))
		if widgetID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "widget id is required"})
			return
		}
		if !widgetAccessAllowed(c, widgetID) {
			return
		}
		if widgetRepo == nil || conversationRepo == nil || messageRepo == nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "analytics not configured"})
			return
		}

		from, to, err := parseTimeRange(c)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if _, err := widgetRepo.FindByID(widgetID); err != nil {
			if err == repositories.ErrWidgetNotFound {
				c.JSON(http.StatusNotFound, gin.H{"error": "widget not found"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load widget"})
			return
		}

		totalMessages, err := messageRepo.CountByWidgetIDBetween(widgetID, from, to)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to compute message totals"})
			return
		}
		userMessages, err := messageRepo.CountByWidgetIDAndRoleBetween(widgetID, "user", from, to)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to compute user message totals"})
			return
		}
		assistantMessages, err := messageRepo.CountByWidgetIDAndRoleBetween(widgetID, "assistant", from, to)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to compute assistant message totals"})
			return
		}

		totalSessions, err := conversationRepo.CountByWidgetIDBetween(widgetID, from, to)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to compute session totals"})
			return
		}

		todayStart := time.Now().UTC().Truncate(24 * time.Hour)
		sessionsToday, err := conversationRepo.CountByWidgetIDSince(widgetID, todayStart)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to compute session totals"})
			return
		}

		latestMessageAt, err := messageRepo.LatestMessageAtByWidgetID(widgetID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to compute last chat timestamp"})
			return
		}

		tokens := []AnalyticsTokenSummary{}
		if apiKeyRepo != nil {
			keys, err := apiKeyRepo.ListByWidgetID(widgetID)
			if err == nil {
				tokens = make([]AnalyticsTokenSummary, 0, len(keys))
				for _, key := range keys {
					var lastUsed *string
					if key.LastUsedAt != nil {
						formatted := key.LastUsedAt.Format(time.RFC3339)
						lastUsed = &formatted
					}
					tokens = append(tokens, AnalyticsTokenSummary{
						ID:         key.ID,
						Name:       key.Name,
						CreatedAt:  key.CreatedAt.Format(time.RFC3339),
						LastUsedAt: lastUsed,
					})
				}
			}
		}

		sessionByOrigin, err := conversationRepo.CountByWidgetIDGroupedByOrigin(widgetID, from, to)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to compute origin sessions"})
			return
		}
		messageByOrigin, err := messageRepo.CountByWidgetIDGroupedByOrigin(widgetID, from, to)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to compute origin messages"})
			return
		}

		originMap := make(map[string]*AnalyticsOriginSummary)
		for _, row := range sessionByOrigin {
			origin := row.Origin
			originMap[origin] = &AnalyticsOriginSummary{
				Origin:   origin,
				Sessions: row.Sessions,
			}
		}
		for _, row := range messageByOrigin {
			origin := row.Origin
			entry, ok := originMap[origin]
			if !ok {
				entry = &AnalyticsOriginSummary{Origin: origin}
				originMap[origin] = entry
			}
			entry.Messages = row.Messages
		}
		perDomain := make([]AnalyticsOriginSummary, 0, len(originMap))
		for _, entry := range originMap {
			perDomain = append(perDomain, *entry)
		}

		response := WidgetAnalyticsResponse{
			WidgetID: widgetID,
			Messages: AnalyticsMessageCounts{
				Total:     totalMessages,
				User:      userMessages,
				Assistant: assistantMessages,
			},
			Sessions: AnalyticsSessionCounts{
				Total: totalSessions,
				Today: sessionsToday,
			},
			Tokens:    tokens,
			PerDomain: perDomain,
		}
		if from != nil {
			value := from.UTC().Format(time.RFC3339)
			response.From = &value
		}
		if to != nil {
			value := to.UTC().Format(time.RFC3339)
			response.To = &value
		}
		if latestMessageAt != nil {
			value := latestMessageAt.UTC().Format(time.RFC3339)
			response.LastChatAt = &value
		}

		c.JSON(http.StatusOK, response)
	}
}

func ListWidgetConversations(conversationRepo repositories.ConversationRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		widgetID := strings.TrimSpace(c.Param("id"))
		if widgetID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "widget id is required"})
			return
		}
		if !widgetAccessAllowed(c, widgetID) {
			return
		}

		from, to, err := parseTimeRange(c)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		limit := clampLimit(c.Query("limit"))
		summaries, err := conversationRepo.ListSummariesByWidgetID(widgetID, from, to, limit)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch conversations"})
			return
		}

		response := make([]ConversationSummaryResponse, 0, len(summaries))
		for _, summary := range summaries {
			response = append(response, ConversationSummaryResponse{
				ID:           summary.ID,
				SessionID:    summary.SessionID,
				Origin:       summary.Origin,
				CreatedAt:    summary.CreatedAt.Format(time.RFC3339),
				MessageCount: summary.MessageCount,
			})
		}
		c.JSON(http.StatusOK, response)
	}
}

func GetConversationMessages(
	conversationRepo repositories.ConversationRepository,
	messageRepo repositories.MessageRepository,
) gin.HandlerFunc {
	return func(c *gin.Context) {
		conversationID := strings.TrimSpace(c.Param("id"))
		if conversationID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "conversation id is required"})
			return
		}

		conversation, err := conversationRepo.FindByID(conversationID)
		if err != nil {
			handleServiceError(c, err)
			return
		}

		if !widgetAccessAllowed(c, conversation.WidgetID) {
			return
		}

		messages, err := messageRepo.FindByConversationID(conversation.ID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch messages"})
			return
		}

		response := make([]ConversationMessageResponse, 0, len(messages))
		for _, msg := range messages {
			response = append(response, ConversationMessageResponse{
				ID:        msg.ID,
				Role:      msg.Role,
				Content:   msg.Content,
				CreatedAt: msg.CreatedAt.Format(time.RFC3339),
			})
		}
		c.JSON(http.StatusOK, response)
	}
}

func widgetAccessAllowed(c *gin.Context, widgetID string) bool {
	claimValue, _ := c.Get("widgetId")
	claimID, _ := claimValue.(string)
	if claimID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "widget context missing"})
		return false
	}
	if claimID != widgetID {
		c.JSON(http.StatusForbidden, gin.H{"error": "widget access denied"})
		return false
	}
	return true
}

func parseTimeRange(c *gin.Context) (*time.Time, *time.Time, error) {
	from, err := parseTime(c.Query("from"))
	if err != nil {
		return nil, nil, err
	}
	to, err := parseTime(c.Query("to"))
	if err != nil {
		return nil, nil, err
	}
	return from, to, nil
}

func parseTime(raw string) (*time.Time, error) {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return nil, nil
	}
	if parsed, err := time.Parse(time.RFC3339, raw); err == nil {
		value := parsed.UTC()
		return &value, nil
	}
	if parsed, err := time.Parse("2006-01-02", raw); err == nil {
		value := parsed.UTC()
		return &value, nil
	}
	return nil, fmt.Errorf("invalid time format: %s", raw)
}

func clampLimit(raw string) int {
	value := 25
	if raw == "" {
		return value
	}
	if parsed, err := strconv.Atoi(raw); err == nil {
		if parsed < 1 {
			return 1
		}
		if parsed > 200 {
			return 200
		}
		return parsed
	}
	return value
}
