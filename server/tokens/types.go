package tokens

// TokenClaims represent the validated widget token context.
type TokenClaims struct {
	TenantID string
	WidgetID string
}

// TokenService validates widget tokens and returns claims.
type TokenService interface {
	ValidateToken(token string) (TokenClaims, error)
}
