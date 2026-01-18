package repositories

import "chatbot_api/models"

// UserRepository defines the interface for user data operations
type UserRepository interface {
	Create(user *models.User) error
	FindByID(id int) (*models.User, error)
	FindByEmail(email string) (*models.User, error)
	FindAll() ([]models.User, error)
	FindAllWithPagination(page, pageSize int) ([]models.User, int64, error)
	Update(user *models.User) error
	Delete(id int) error
	ExistsByEmail(email string) (bool, error)
}

// ConversationRepository defines the interface for conversation operations
type ConversationRepository interface {
	FindBySession(tenantID, widgetID, sessionID string) (*models.Conversation, error)
	FindOrCreate(tenantID, widgetID, sessionID string) (*models.Conversation, error)
	Create(conversation *models.Conversation) error
}

// MessageRepository defines the interface for message operations
type MessageRepository interface {
	Create(message *models.Message) error
	FindByConversationID(conversationID string) ([]models.Message, error)
}

// WidgetRepository defines the interface for widget operations
type WidgetRepository interface {
	FindByID(id string) (*models.Widget, error)
	Create(widget *models.Widget) error
	Update(widget *models.Widget) error
}

// TenantRepository defines the interface for tenant operations
type TenantRepository interface {
	FindByID(id string) (*models.Tenant, error)
	Create(tenant *models.Tenant) error
}

// ApiKeyRepository defines the interface for widget API keys
type ApiKeyRepository interface {
	Create(apiKey *models.ApiKey) error
	FindByHashedKey(hashedKey string) (*models.ApiKey, error)
}
