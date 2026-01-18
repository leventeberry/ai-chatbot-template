package factories

import (
	"chatbot_api/repositories"
	"gorm.io/gorm"
)

// RepositoryFactory creates repository instances
// Implements Factory Pattern for repository creation
type RepositoryFactory struct {
	db *gorm.DB
}

// NewRepositoryFactory creates a new repository factory
func NewRepositoryFactory(db *gorm.DB) *RepositoryFactory {
	return &RepositoryFactory{
		db: db,
	}
}

// CreateUserRepository creates a UserRepository instance
func (f *RepositoryFactory) CreateUserRepository() repositories.UserRepository {
	return repositories.NewUserRepository(f.db)
}

// CreateConversationRepository creates a ConversationRepository instance
func (f *RepositoryFactory) CreateConversationRepository() repositories.ConversationRepository {
	return repositories.NewConversationRepository(f.db)
}

// CreateMessageRepository creates a MessageRepository instance
func (f *RepositoryFactory) CreateMessageRepository() repositories.MessageRepository {
	return repositories.NewMessageRepository(f.db)
}

// CreateWidgetRepository creates a WidgetRepository instance
func (f *RepositoryFactory) CreateWidgetRepository() repositories.WidgetRepository {
	return repositories.NewWidgetRepository(f.db)
}

// CreateTenantRepository creates a TenantRepository instance
func (f *RepositoryFactory) CreateTenantRepository() repositories.TenantRepository {
	return repositories.NewTenantRepository(f.db)
}

// CreateApiKeyRepository creates an ApiKeyRepository instance
func (f *RepositoryFactory) CreateApiKeyRepository() repositories.ApiKeyRepository {
	return repositories.NewApiKeyRepository(f.db)
}
