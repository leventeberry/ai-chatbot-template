package services

import (
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"os"
	"strings"

	"chatbot_api/logger"
	"chatbot_api/repositories"
	"chatbot_api/tokens"
)

type envTokenService struct {
	apiKeyRepo    repositories.ApiKeyRepository
	expectedToken string
	tenantID      string
	widgetID      string
	authDisabled  bool
}

func NewTokenService(apiKeyRepo repositories.ApiKeyRepository) tokens.TokenService {
	authDisabled := strings.ToLower(strings.TrimSpace(os.Getenv("WIDGET_AUTH_DISABLED"))) == "true"

	return &envTokenService{
		apiKeyRepo:    apiKeyRepo,
		expectedToken: strings.TrimSpace(os.Getenv("WIDGET_TOKEN")),
		tenantID:      strings.TrimSpace(os.Getenv("WIDGET_TENANT_ID")),
		widgetID:      strings.TrimSpace(os.Getenv("WIDGET_ID")),
		authDisabled:  authDisabled,
	}
}

func (s *envTokenService) ValidateToken(token string) (tokens.TokenClaims, error) {
	if token == "" {
		return tokens.TokenClaims{}, errors.New("missing bearer token")
	}

	if s.apiKeyRepo != nil {
		hashed := sha256.Sum256([]byte(token))
		apiKey, err := s.apiKeyRepo.FindByHashedKey(hex.EncodeToString(hashed[:]))
		if err != nil {
			if s.authDisabled {
				return s.defaultClaims(), nil
			}
			return tokens.TokenClaims{}, errors.New("invalid widget token")
		}

		if err := s.apiKeyRepo.TouchLastUsedAt(apiKey.ID); err != nil {
			logger.Log.Warn().Err(err).Msg("Failed to update widget token last_used_at")
		}

		return tokens.TokenClaims{
			TenantID: apiKey.TenantID,
			WidgetID: apiKey.WidgetID,
		}, nil
	}

	if s.authDisabled {
		return s.defaultClaims(), nil
	}

	if s.expectedToken == "" {
		return tokens.TokenClaims{}, errors.New("widget token not configured")
	}

	if token != s.expectedToken {
		return tokens.TokenClaims{}, errors.New("invalid widget token")
	}

	return s.defaultClaims(), nil
}

func (s *envTokenService) defaultClaims() tokens.TokenClaims {
	tenantID := s.tenantID
	if tenantID == "" {
		tenantID = "00000000-0000-0000-0000-000000000001"
	}

	widgetID := s.widgetID
	if widgetID == "" {
		widgetID = "00000000-0000-0000-0000-000000000002"
	}

	return tokens.TokenClaims{
		TenantID: tenantID,
		WidgetID: widgetID,
	}
}
