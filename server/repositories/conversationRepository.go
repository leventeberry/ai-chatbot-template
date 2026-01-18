package repositories

import (
	"errors"
	"fmt"

	"chatbot_api/models"
	"gorm.io/gorm"
)

// conversationRepository implements ConversationRepository interface
type conversationRepository struct {
	db *gorm.DB
}

// NewConversationRepository creates a new instance of ConversationRepository
func NewConversationRepository(db *gorm.DB) ConversationRepository {
	return &conversationRepository{
		db: db,
	}
}

func (r *conversationRepository) FindBySession(tenantID, widgetID, sessionID string) (*models.Conversation, error) {
	var conversation models.Conversation
	err := r.db.Where(
		"tenant_id = ? AND widget_id = ? AND session_id = ?",
		tenantID,
		widgetID,
		sessionID,
	).First(&conversation).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrConversationNotFound
		}
		return nil, fmt.Errorf("failed to find conversation: %w", err)
	}

	return &conversation, nil
}

func (r *conversationRepository) Create(conversation *models.Conversation) error {
	if err := r.db.Create(conversation).Error; err != nil {
		return fmt.Errorf("failed to create conversation: %w", err)
	}
	return nil
}

func (r *conversationRepository) FindOrCreate(tenantID, widgetID, sessionID string) (*models.Conversation, error) {
	conversation, err := r.FindBySession(tenantID, widgetID, sessionID)
	if err == nil {
		return conversation, nil
	}
	if !errors.Is(err, ErrConversationNotFound) {
		return nil, err
	}

	conversation = &models.Conversation{
		TenantID:  tenantID,
		WidgetID:  widgetID,
		SessionID: sessionID,
	}
	if err := r.Create(conversation); err != nil {
		return nil, err
	}
	return conversation, nil
}
