package repositories

import (
	"fmt"
	"time"

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

func (r *messageRepository) CountByWidgetIDBetween(widgetID string, from, to *time.Time) (int64, error) {
	var count int64
	query := r.db.Table("messages").
		Joins("JOIN conversations ON conversations.id = messages.conversation_id").
		Where("conversations.widget_id = ?", widgetID)
	if from != nil {
		query = query.Where("messages.created_at >= ?", *from)
	}
	if to != nil {
		query = query.Where("messages.created_at <= ?", *to)
	}
	if err := query.Count(&count).Error; err != nil {
		return 0, fmt.Errorf("failed to count messages: %w", err)
	}
	return count, nil
}

func (r *messageRepository) CountByWidgetIDAndRoleBetween(widgetID, role string, from, to *time.Time) (int64, error) {
	var count int64
	query := r.db.Table("messages").
		Joins("JOIN conversations ON conversations.id = messages.conversation_id").
		Where("conversations.widget_id = ? AND messages.role = ?", widgetID, role)
	if from != nil {
		query = query.Where("messages.created_at >= ?", *from)
	}
	if to != nil {
		query = query.Where("messages.created_at <= ?", *to)
	}
	if err := query.Count(&count).Error; err != nil {
		return 0, fmt.Errorf("failed to count messages by role: %w", err)
	}
	return count, nil
}

func (r *messageRepository) CountByWidgetIDGroupedByOrigin(widgetID string, from, to *time.Time) ([]OriginMessageCount, error) {
	query := r.db.Table("messages").
		Select("COALESCE(conversations.origin, '') as origin, COUNT(messages.id) as messages").
		Joins("JOIN conversations ON conversations.id = messages.conversation_id").
		Where("conversations.widget_id = ?", widgetID).
		Group("conversations.origin").
		Order("messages desc")
	if from != nil {
		query = query.Where("messages.created_at >= ?", *from)
	}
	if to != nil {
		query = query.Where("messages.created_at <= ?", *to)
	}

	var rows []OriginMessageCount
	if err := query.Scan(&rows).Error; err != nil {
		return nil, fmt.Errorf("failed to count messages by origin: %w", err)
	}
	return rows, nil
}

func (r *messageRepository) LatestMessageAtByWidgetID(widgetID string) (*time.Time, error) {
	var latest *time.Time
	query := r.db.Table("messages").
		Select("MAX(messages.created_at)").
		Joins("JOIN conversations ON conversations.id = messages.conversation_id").
		Where("conversations.widget_id = ?", widgetID)
	if err := query.Scan(&latest).Error; err != nil {
		return nil, fmt.Errorf("failed to fetch latest message timestamp: %w", err)
	}
	return latest, nil
}
