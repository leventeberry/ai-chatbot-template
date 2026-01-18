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
