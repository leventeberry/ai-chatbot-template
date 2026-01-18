package services

import (
	"errors"
	"os"
	"strings"

	"chatbot_api/tokens"
)

type envTokenService struct {
	expectedToken string
	tenantID      string
	widgetID      string
	authDisabled  bool
}

func NewTokenService() tokens.TokenService {
	authDisabled := strings.ToLower(strings.TrimSpace(os.Getenv("WIDGET_AUTH_DISABLED"))) == "true"

	return &envTokenService{
		expectedToken: strings.TrimSpace(os.Getenv("WIDGET_TOKEN")),
		tenantID:      strings.TrimSpace(os.Getenv("WIDGET_TENANT_ID")),
		widgetID:      strings.TrimSpace(os.Getenv("WIDGET_ID")),
		authDisabled:  authDisabled,
	}
}

func (s *envTokenService) ValidateToken(token string) (tokens.TokenClaims, error) {
	claims := s.defaultClaims()

	if s.authDisabled {
		return claims, nil
	}

	if token == "" {
		return tokens.TokenClaims{}, errors.New("missing bearer token")
	}

	if s.expectedToken == "" {
		return tokens.TokenClaims{}, errors.New("widget token not configured")
	}

	if token != s.expectedToken {
		return tokens.TokenClaims{}, errors.New("invalid widget token")
	}

	return claims, nil
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
