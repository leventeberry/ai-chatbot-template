package container

import (
	"chatbot_api/cache"
	"chatbot_api/factories"
	"chatbot_api/repositories"
	"chatbot_api/services"
	"chatbot_api/tokens"
	"gorm.io/gorm"
)

// Container holds all application dependencies
// Implements Dependency Injection Container pattern
type Container struct {
	DB                *gorm.DB
	Cache             cache.Cache
	RepositoryFactory *factories.RepositoryFactory
	ServiceFactory    *factories.ServiceFactory
	UserRepository    repositories.UserRepository
	WidgetRepository  repositories.WidgetRepository
	UserService       services.UserService
	AuthService       services.AuthService
	ChatService       services.ChatService
	TokenService      tokens.TokenService
}

// NewContainer creates and initializes a new dependency injection container
// Uses Factory Pattern to create all dependencies
func NewContainer(db *gorm.DB, cacheClient cache.Cache) *Container {
	var (
		repoFactory      *factories.RepositoryFactory
		serviceFactory   *factories.ServiceFactory
		userRepo         repositories.UserRepository
		conversationRepo repositories.ConversationRepository
		messageRepo      repositories.MessageRepository
		widgetRepo       repositories.WidgetRepository
		userService      services.UserService
		authService      services.AuthService
	)

	if db != nil {
		repoFactory = factories.NewRepositoryFactory(db)
		userRepo = repoFactory.CreateUserRepository()
		conversationRepo = repoFactory.CreateConversationRepository()
		messageRepo = repoFactory.CreateMessageRepository()
		widgetRepo = repoFactory.CreateWidgetRepository()
		serviceFactory = factories.NewServiceFactory(userRepo, conversationRepo, messageRepo, cacheClient)
		userService = serviceFactory.CreateUserService()
		authService = serviceFactory.CreateAuthService()
	} else {
		serviceFactory = factories.NewServiceFactory(nil, nil, nil, cacheClient)
	}

	chatService := serviceFactory.CreateChatService()
	tokenService := serviceFactory.CreateTokenService()

	return &Container{
		DB:                db,
		Cache:             cacheClient,
		RepositoryFactory: repoFactory,
		ServiceFactory:    serviceFactory,
		UserRepository:    userRepo,
		WidgetRepository:  widgetRepo,
		UserService:       userService,
		AuthService:       authService,
		ChatService:       chatService,
		TokenService:      tokenService,
	}
}
