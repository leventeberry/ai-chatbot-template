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
)

type ChatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ChatService interface {
	GetHistory(ctx context.Context) []ChatMessage
	SendMessage(ctx context.Context, message string) ChatMessage
}

type chatService struct {
	mu       sync.Mutex
	history  []ChatMessage
	apiKey   string
	baseURL  string
	model    string
	client   *http.Client
	fallback string
}

func NewChatService() ChatService {
	baseURL := strings.TrimSpace(os.Getenv("AI_INTEGRATIONS_OPENAI_BASE_URL"))
	if baseURL == "" {
		baseURL = "https://api.openai.com/v1"
	}

	model := strings.TrimSpace(os.Getenv("AI_INTEGRATIONS_OPENAI_MODEL"))
	if model == "" {
		model = "gpt-5.1"
	}

	return &chatService{
		apiKey:   strings.TrimSpace(os.Getenv("AI_INTEGRATIONS_OPENAI_API_KEY")),
		baseURL:  baseURL,
		model:    model,
		client:   &http.Client{Timeout: 60 * time.Second},
		fallback: "Sorry, I'm having trouble connecting to the AI.",
	}
}

func (s *chatService) GetHistory(_ context.Context) []ChatMessage {
	s.mu.Lock()
	defer s.mu.Unlock()

	if s.history == nil {
		return []ChatMessage{}
	}

	return append([]ChatMessage(nil), s.history...)
}

func (s *chatService) SendMessage(ctx context.Context, message string) ChatMessage {
	trimmed := strings.TrimSpace(message)
	if trimmed == "" {
		return ChatMessage{Role: "assistant", Content: "Message is required."}
	}

	userMsg := ChatMessage{Role: "user", Content: trimmed}
	s.mu.Lock()
	s.history = append(s.history, userMsg)
	historySnapshot := append([]ChatMessage(nil), s.history...)
	s.mu.Unlock()

	if s.apiKey == "" {
		resp := ChatMessage{
			Role:    "assistant",
			Content: "AI key is not configured for this deployment.",
		}
		s.appendAssistant(resp)
		return resp
	}

	resp, err := s.callOpenAI(ctx, historySnapshot)
	if err != nil {
		logger.Log.Warn().Err(err).Msg("OpenAI request failed")
		resp = ChatMessage{Role: "assistant", Content: s.fallback}
	}

	s.appendAssistant(resp)
	return resp
}

func (s *chatService) appendAssistant(msg ChatMessage) {
	s.mu.Lock()
	s.history = append(s.history, msg)
	s.mu.Unlock()
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
