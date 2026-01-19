package factories

import (
	"chatbot_api/cache"
	"chatbot_api/repositories"
	"chatbot_api/services"
	"chatbot_api/tokens"
)

// ServiceFactory creates service instances
// Implements Factory Pattern for service creation
type ServiceFactory struct {
	userRepo         repositories.UserRepository
	conversationRepo repositories.ConversationRepository
	messageRepo      repositories.MessageRepository
	apiKeyRepo       repositories.ApiKeyRepository
	tenantRepo       repositories.TenantRepository
	widgetRepo       repositories.WidgetRepository
	cache            cache.Cache
}

// NewServiceFactory creates a new service factory
func NewServiceFactory(
	userRepo repositories.UserRepository,
	conversationRepo repositories.ConversationRepository,
	messageRepo repositories.MessageRepository,
	apiKeyRepo repositories.ApiKeyRepository,
	tenantRepo repositories.TenantRepository,
	widgetRepo repositories.WidgetRepository,
	cacheClient cache.Cache,
) *ServiceFactory {
	return &ServiceFactory{
		userRepo:         userRepo,
		conversationRepo: conversationRepo,
		messageRepo:      messageRepo,
		apiKeyRepo:       apiKeyRepo,
		tenantRepo:       tenantRepo,
		widgetRepo:       widgetRepo,
		cache:            cacheClient,
	}
}

// CreateUserService creates a UserService instance
func (f *ServiceFactory) CreateUserService() services.UserService {
	return services.NewUserService(f.userRepo, f.cache)
}

// CreateAuthService creates an AuthService instance
func (f *ServiceFactory) CreateAuthService() services.AuthService {
	return services.NewAuthService(f.userRepo, f.tenantRepo, f.widgetRepo)
}

// CreateChatService creates a ChatService instance
func (f *ServiceFactory) CreateChatService() services.ChatService {
	return services.NewChatService(f.conversationRepo, f.messageRepo)
}

// CreateTokenService creates a TokenService instance
func (f *ServiceFactory) CreateTokenService() tokens.TokenService {
	return services.NewTokenService(f.apiKeyRepo)
}
