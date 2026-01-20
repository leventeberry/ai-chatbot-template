package services

import (
	"fmt"
	"strings"

	"chatbot_api/middleware"
	"chatbot_api/models"
	"chatbot_api/repositories"
)

// authService implements AuthService interface
type authService struct {
	userRepo   repositories.UserRepository
	tenantRepo repositories.TenantRepository
	widgetRepo repositories.WidgetRepository
}

// NewAuthService creates a new instance of AuthService
// Factory function for creating auth service
func NewAuthService(
	userRepo repositories.UserRepository,
	tenantRepo repositories.TenantRepository,
	widgetRepo repositories.WidgetRepository,
) AuthService {
	return &authService{
		userRepo:   userRepo,
		tenantRepo: tenantRepo,
		widgetRepo: widgetRepo,
	}
}

// Login authenticates a user and returns a JWT token
func (s *authService) Login(email, password string) (*models.User, *middleware.Authentication, error) {
	// Validate credentials
	user, err := s.ValidateCredentials(email, password)
	if err != nil {
		return nil, nil, err
	}

	if err := s.ensureUserTenantWidget(user); err != nil {
		return nil, nil, err
	}

	if strings.TrimSpace(user.Tier) == "" {
		user.Tier = "Basic"
		if err := s.userRepo.Update(user); err != nil {
			return nil, nil, fmt.Errorf("failed to update user tier: %w", err)
		}
	}

	// Generate JWT token with user role
	token, err := middleware.CreateToken(user.ID, user.Role, user.TenantID, user.WidgetID)
	if err != nil {
		return nil, nil, ErrTokenGeneration
	}

	return user, token, nil
}

// Register creates a new user account and returns a JWT token
func (s *authService) Register(input *RegisterInput) (*models.User, *middleware.Authentication, error) {
	if s.tenantRepo == nil || s.widgetRepo == nil {
		return nil, nil, ErrMissingTenantWidget
	}

	// Create user directly here to avoid circular dependency
	// In a more advanced setup, we'd use a service orchestrator or composition

	// Validate role
	if input.Role != "" && !IsValidRole(input.Role) {
		return nil, nil, ErrInvalidRole
	}

	// Set default role
	role := input.Role
	if role == "" {
		role = "user"
	}

	tier := strings.TrimSpace(input.Tier)
	if tier == "" {
		tier = "Basic"
	}

	// Check if email exists
	exists, err := s.userRepo.ExistsByEmail(input.Email)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to check email existence during registration: %w", err)
	}
	if exists {
		return nil, nil, ErrEmailExists
	}

	// Hash password
	hash, err := middleware.HashPassword(input.Password)
	if err != nil {
		return nil, nil, ErrPasswordHashing
	}

	// Create user
	tenantName := strings.TrimSpace(strings.Join([]string{input.FirstName, input.LastName}, " "))
	if tenantName == "" {
		tenantName = input.Email
	}

	tenant := &models.Tenant{Name: tenantName}
	if err := s.tenantRepo.Create(tenant); err != nil {
		return nil, nil, fmt.Errorf("failed to create tenant during registration: %w", err)
	}

	widgetName := strings.TrimSpace(input.FirstName)
	if widgetName == "" {
		widgetName = "Default Widget"
	} else {
		widgetName = widgetName + "'s Widget"
	}

	widget := &models.Widget{
		TenantID: tenant.ID,
		Name:     widgetName,
	}
	if err := s.widgetRepo.Create(widget); err != nil {
		return nil, nil, fmt.Errorf("failed to create widget during registration: %w", err)
	}

	user := &models.User{
		TenantID:  tenant.ID,
		WidgetID:  widget.ID,
		FirstName: input.FirstName,
		LastName:  input.LastName,
		Email:     input.Email,
		PassHash:  hash,
		PhoneNum:  input.PhoneNum,
		Role:      role,
		Tier:      tier,
	}

	if err := s.userRepo.Create(user); err != nil {
		return nil, nil, fmt.Errorf("failed to create user during registration: %w", err)
	}

	// Generate JWT token with user role
	token, err := middleware.CreateToken(user.ID, user.Role, user.TenantID, user.WidgetID)
	if err != nil {
		return nil, nil, ErrTokenGeneration
	}

	return user, token, nil
}

func (s *authService) ensureUserTenantWidget(user *models.User) error {
	if user.TenantID != "" && user.WidgetID != "" {
		return nil
	}
	if s.tenantRepo == nil || s.widgetRepo == nil {
		return ErrMissingTenantWidget
	}

	tenantName := strings.TrimSpace(strings.Join([]string{user.FirstName, user.LastName}, " "))
	if tenantName == "" {
		tenantName = user.Email
	}

	tenant := &models.Tenant{Name: tenantName}
	if err := s.tenantRepo.Create(tenant); err != nil {
		return fmt.Errorf("failed to create tenant during login: %w", err)
	}

	widgetName := strings.TrimSpace(user.FirstName)
	if widgetName == "" {
		widgetName = "Default Widget"
	} else {
		widgetName = widgetName + "'s Widget"
	}

	widget := &models.Widget{
		TenantID: tenant.ID,
		Name:     widgetName,
	}
	if err := s.widgetRepo.Create(widget); err != nil {
		return fmt.Errorf("failed to create widget during login: %w", err)
	}

	user.TenantID = tenant.ID
	user.WidgetID = widget.ID
	if err := s.userRepo.Update(user); err != nil {
		return fmt.Errorf("failed to update user tenant/widget: %w", err)
	}

	return nil
}

// ValidateCredentials validates user email and password
func (s *authService) ValidateCredentials(email, password string) (*models.User, error) {
	// Find user by email
	user, err := s.userRepo.FindByEmail(email)
	if err != nil {
		return nil, ErrInvalidCredentials
	}

	// Verify password
	if !middleware.ComparePasswords(user.PassHash, password) {
		return nil, ErrInvalidCredentials
	}

	return user, nil
}

