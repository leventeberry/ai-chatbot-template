package services

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"chatbot_api/logger"
	"chatbot_api/models"
	"chatbot_api/repositories"
)

type ChatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ChatService interface {
	GetHistory(ctx context.Context, tenantID, widgetID, sessionID string) []ChatMessage
	SendMessage(ctx context.Context, tenantID, widgetID, sessionID, origin, message string) ChatMessage
}

type chatService struct {
	mu               sync.Mutex
	history          map[string][]ChatMessage
	conversationRepo repositories.ConversationRepository
	messageRepo      repositories.MessageRepository
	widgetRepo       repositories.WidgetRepository
	apiKey           string
	baseURL          string
	model            string
	client           *http.Client
	fallback         string
	demoWidgetID     string
	demoPrompt       string
	demoDocs         string
}

func NewChatService(
	conversationRepo repositories.ConversationRepository,
	messageRepo repositories.MessageRepository,
	widgetRepo repositories.WidgetRepository,
) ChatService {
	baseURL := strings.TrimSpace(os.Getenv("AI_INTEGRATIONS_OPENAI_BASE_URL"))
	if baseURL == "" {
		baseURL = "https://api.openai.com/v1"
	}

	model := strings.TrimSpace(os.Getenv("AI_INTEGRATIONS_OPENAI_MODEL"))
	if model == "" {
		model = "gpt-5.1"
	}

	return &chatService{
		history:          map[string][]ChatMessage{},
		conversationRepo: conversationRepo,
		messageRepo:      messageRepo,
		widgetRepo:       widgetRepo,
		apiKey:           strings.TrimSpace(os.Getenv("AI_INTEGRATIONS_OPENAI_API_KEY")),
		baseURL:          baseURL,
		model:            model,
		client:           &http.Client{Timeout: 60 * time.Second},
		fallback:         "Sorry, I'm having trouble connecting to the AI.",
		demoWidgetID:     strings.TrimSpace(os.Getenv("DEMO_WIDGET_ID")),
		demoPrompt:       strings.TrimSpace(os.Getenv("DEMO_SYSTEM_PROMPT")),
		demoDocs:         strings.TrimSpace(os.Getenv("DEMO_DOCUMENTATION")),
	}
}

func (s *chatService) GetHistory(ctx context.Context, tenantID, widgetID, sessionID string) []ChatMessage {
	if !s.hasRepositories() {
		return s.getHistoryInMemory(tenantID, widgetID, sessionID)
	}

	conversation, err := s.conversationRepo.FindBySession(tenantID, widgetID, sessionID)
	if err != nil {
		if errors.Is(err, repositories.ErrConversationNotFound) {
			return []ChatMessage{}
		}
		logger.Log.Warn().Err(err).Msg("Failed to fetch conversation")
		return []ChatMessage{}
	}

	messages, err := s.messageRepo.FindByConversationID(conversation.ID)
	if err != nil {
		logger.Log.Warn().Err(err).Msg("Failed to fetch messages")
		return []ChatMessage{}
	}

	return mapMessages(messages)
}

func (s *chatService) SendMessage(ctx context.Context, tenantID, widgetID, sessionID, origin, message string) ChatMessage {
	trimmed := strings.TrimSpace(message)
	if trimmed == "" {
		return ChatMessage{Role: "assistant", Content: "Message is required."}
	}

	if !s.hasRepositories() {
		return s.sendMessageInMemory(tenantID, widgetID, sessionID, trimmed)
	}

	if s.apiKey == "" {
		resp := ChatMessage{
			Role:    "assistant",
			Content: "AI key is not configured for this deployment.",
		}
		s.appendMessageDB(tenantID, widgetID, sessionID, origin, resp)
		return resp
	}

	conversation, err := s.conversationRepo.FindOrCreate(tenantID, widgetID, sessionID, origin)
	if err != nil {
		logger.Log.Warn().Err(err).Msg("Failed to fetch conversation")
		return ChatMessage{Role: "assistant", Content: s.fallback}
	}

	if err := s.messageRepo.Create(&models.Message{
		TenantID:       tenantID,
		ConversationID: conversation.ID,
		Role:           "user",
		Content:        trimmed,
	}); err != nil {
		logger.Log.Warn().Err(err).Msg("Failed to store user message")
		return ChatMessage{Role: "assistant", Content: s.fallback}
	}

	historySnapshot := s.GetHistory(ctx, tenantID, widgetID, sessionID)
	modelMessages := s.withSystemMessage(ctx, widgetID, historySnapshot)
	resp, err := s.callOpenAI(ctx, modelMessages)
	if err != nil {
		logger.Log.Warn().Err(err).Msg("OpenAI request failed")
		resp = ChatMessage{Role: "assistant", Content: s.fallback}
	}

	s.appendMessageDB(tenantID, widgetID, sessionID, origin, resp)
	return resp
}

func (s *chatService) hasRepositories() bool {
	return s.conversationRepo != nil && s.messageRepo != nil
}

func (s *chatService) getHistoryInMemory(tenantID, widgetID, sessionID string) []ChatMessage {
	key := historyKey(tenantID, widgetID, sessionID)
	s.mu.Lock()
	defer s.mu.Unlock()

	history := s.history[key]
	return append([]ChatMessage(nil), history...)
}

func (s *chatService) sendMessageInMemory(tenantID, widgetID, sessionID, message string) ChatMessage {
	key := historyKey(tenantID, widgetID, sessionID)
	userMsg := ChatMessage{Role: "user", Content: message}

	s.mu.Lock()
	s.history[key] = append(s.history[key], userMsg)
	historySnapshot := append([]ChatMessage(nil), s.history[key]...)
	s.mu.Unlock()

	if s.apiKey == "" {
		resp := ChatMessage{
			Role:    "assistant",
			Content: "AI key is not configured for this deployment.",
		}
		s.appendAssistantInMemory(key, resp)
		return resp
	}

	modelMessages := s.withSystemMessage(context.Background(), widgetID, historySnapshot)
	resp, err := s.callOpenAI(context.Background(), modelMessages)
	if err != nil {
		logger.Log.Warn().Err(err).Msg("OpenAI request failed")
		resp = ChatMessage{Role: "assistant", Content: s.fallback}
	}

	s.appendAssistantInMemory(key, resp)
	return resp
}

func (s *chatService) appendAssistantInMemory(key string, msg ChatMessage) {
	s.mu.Lock()
	s.history[key] = append(s.history[key], msg)
	s.mu.Unlock()
}

func (s *chatService) appendMessageDB(tenantID, widgetID, sessionID, origin string, msg ChatMessage) {
	conversation, err := s.conversationRepo.FindOrCreate(tenantID, widgetID, sessionID, origin)
	if err != nil {
		logger.Log.Warn().Err(err).Msg("Failed to fetch conversation for assistant message")
		return
	}

	if err := s.messageRepo.Create(&models.Message{
		TenantID:       tenantID,
		ConversationID: conversation.ID,
		Role:           msg.Role,
		Content:        msg.Content,
	}); err != nil {
		logger.Log.Warn().Err(err).Msg("Failed to store assistant message")
	}
}

func (s *chatService) callOpenAI(ctx context.Context, msgs []ChatMessage) (ChatMessage, error) {
	payload := map[string]interface{}{
		"model":    s.model,
		"messages": msgs,
	}

	bodyBytes, err := json.Marshal(payload)
	if err != nil {
		return ChatMessage{}, err
	}

	req, err := http.NewRequestWithContext(
		ctx,
		http.MethodPost,
		s.baseURL+"/chat/completions",
		bytes.NewBuffer(bodyBytes),
	)
	if err != nil {
		return ChatMessage{}, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+s.apiKey)

	resp, err := s.client.Do(req)
	if err != nil {
		return ChatMessage{}, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(resp.Body)
		return ChatMessage{}, errors.New(string(b))
	}

	var result struct {
		Choices []struct {
			Message ChatMessage `json:"message"`
		} `json:"choices"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return ChatMessage{}, err
	}

	if len(result.Choices) == 0 {
		return ChatMessage{}, errors.New("no choices in response")
	}

	return result.Choices[0].Message, nil
}

type widgetPromptConfig struct {
	SystemPrompt  string `json:"systemPrompt"`
	Documentation string `json:"documentation"`
}

func (s *chatService) withSystemMessage(
	ctx context.Context,
	widgetID string,
	history []ChatMessage,
) []ChatMessage {
	prompt, docs := s.resolvePrompt(ctx, widgetID)
	systemMessage := buildSystemMessage(prompt, docs)
	if systemMessage == nil {
		return history
	}

	messages := make([]ChatMessage, 0, len(history)+1)
	messages = append(messages, *systemMessage)
	messages = append(messages, history...)
	return messages
}

func (s *chatService) resolvePrompt(ctx context.Context, widgetID string) (string, string) {
	if widgetID == "" {
		return "", ""
	}

	if s.demoWidgetID != "" && widgetID == s.demoWidgetID {
		if s.demoPrompt != "" || s.demoDocs != "" {
			return s.demoPrompt, s.demoDocs
		}
	}

	if s.widgetRepo == nil {
		return "", ""
	}

	widget, err := s.widgetRepo.FindByID(widgetID)
	if err != nil {
		logger.Log.Warn().Err(err).Msg("Failed to load widget for prompt resolution")
		return "", ""
	}

	config := parseWidgetPromptConfig(widget.Config)
	return config.SystemPrompt, config.Documentation
}

func parseWidgetPromptConfig(raw string) widgetPromptConfig {
	if strings.TrimSpace(raw) == "" {
		return widgetPromptConfig{}
	}
	var config widgetPromptConfig
	if err := json.Unmarshal([]byte(raw), &config); err != nil {
		return widgetPromptConfig{}
	}
	return config
}

func buildSystemMessage(prompt, documentation string) *ChatMessage {
	prompt = strings.TrimSpace(prompt)
	documentation = strings.TrimSpace(documentation)

	if prompt == "" && documentation == "" {
		return nil
	}

	content := prompt
	if documentation != "" {
		if content != "" {
			content += "\n\n"
		}
		content += "Documentation:\n" + documentation
	}

	return &ChatMessage{
		Role:    "system",
		Content: content,
	}
}

func historyKey(tenantID, widgetID, sessionID string) string {
	return tenantID + ":" + widgetID + ":" + sessionID
}

func mapMessages(messages []models.Message) []ChatMessage {
	result := make([]ChatMessage, 0, len(messages))
	for _, msg := range messages {
		result = append(result, ChatMessage{
			Role:    msg.Role,
			Content: msg.Content,
		})
	}
	return result
}
