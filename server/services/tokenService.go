package services

import (
	"errors"
	"os"
	"strings"
)

type TokenClaims struct {
	TenantID string
	WidgetID string
}

type TokenService interface {
	ValidateToken(token string) (TokenClaims, error)
}

type envTokenService struct {
	expectedToken string
	tenantID      string
	widgetID      string
	authDisabled  bool
}

func NewTokenService() TokenService {
	authDisabled := strings.ToLower(strings.TrimSpace(os.Getenv("WIDGET_AUTH_DISABLED"))) == "true"

	return &envTokenService{
		expectedToken: strings.TrimSpace(os.Getenv("WIDGET_TOKEN")),
		tenantID:      strings.TrimSpace(os.Getenv("WIDGET_TENANT_ID")),
		widgetID:      strings.TrimSpace(os.Getenv("WIDGET_ID")),
		authDisabled:  authDisabled,
	}
}

func (s *envTokenService) ValidateToken(token string) (TokenClaims, error) {
	claims := s.defaultClaims()

	if s.authDisabled {
		return claims, nil
	}

	if token == "" {
		return TokenClaims{}, errors.New("missing bearer token")
	}

	if s.expectedToken == "" {
		return TokenClaims{}, errors.New("widget token not configured")
	}

	if token != s.expectedToken {
		return TokenClaims{}, errors.New("invalid widget token")
	}

	return claims, nil
}

func (s *envTokenService) defaultClaims() TokenClaims {
	tenantID := s.tenantID
	if tenantID == "" {
		tenantID = "dev-tenant"
	}

	widgetID := s.widgetID
	if widgetID == "" {
		widgetID = "dev-widget"
	}

	return TokenClaims{
		TenantID: tenantID,
		WidgetID: widgetID,
	}
}
