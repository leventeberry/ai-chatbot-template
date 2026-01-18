package repositories

import (
	"fmt"

	"chatbot_api/models"
	"gorm.io/gorm"
)

// messageRepository implements MessageRepository interface
type messageRepository struct {
	db *gorm.DB
}

// NewMessageRepository creates a new instance of MessageRepository
func NewMessageRepository(db *gorm.DB) MessageRepository {
	return &messageRepository{
		db: db,
	}
}

func (r *messageRepository) Create(message *models.Message) error {
	if err := r.db.Create(message).Error; err != nil {
		return fmt.Errorf("failed to create message: %w", err)
	}
	return nil
}

func (r *messageRepository) FindByConversationID(conversationID string) ([]models.Message, error) {
	var messages []models.Message
	if err := r.db.
		Where("conversation_id = ?", conversationID).
		Order("created_at asc").
		Find(&messages).Error; err != nil {
		return nil, fmt.Errorf("failed to fetch messages: %w", err)
	}
	return messages, nil
}
