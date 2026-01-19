package repositories

import (
	"errors"
	"fmt"
	"time"

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

func (r *conversationRepository) FindByID(id string) (*models.Conversation, error) {
	var conversation models.Conversation
	err := r.db.First(&conversation, "id = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrConversationNotFound
		}
		return nil, fmt.Errorf("failed to find conversation by ID %s: %w", id, err)
	}
	return &conversation, nil
}

func (r *conversationRepository) Create(conversation *models.Conversation) error {
	if err := r.db.Create(conversation).Error; err != nil {
		return fmt.Errorf("failed to create conversation: %w", err)
	}
	return nil
}

func (r *conversationRepository) FindOrCreate(tenantID, widgetID, sessionID, origin string) (*models.Conversation, error) {
	conversation, err := r.FindBySession(tenantID, widgetID, sessionID)
	if err == nil {
		if origin != "" && conversation.Origin == "" {
			if err := r.db.Model(conversation).Update("origin", origin).Error; err != nil {
				return nil, fmt.Errorf("failed to update conversation origin: %w", err)
			}
			conversation.Origin = origin
		}
		return conversation, nil
	}
	if !errors.Is(err, ErrConversationNotFound) {
		return nil, err
	}

	conversation = &models.Conversation{
		TenantID:  tenantID,
		WidgetID:  widgetID,
		SessionID: sessionID,
		Origin:    origin,
	}
	if err := r.Create(conversation); err != nil {
		return nil, err
	}
	return conversation, nil
}

func (r *conversationRepository) CountByWidgetIDBetween(widgetID string, from, to *time.Time) (int64, error) {
	var count int64
	query := r.db.Model(&models.Conversation{}).Where("widget_id = ?", widgetID)
	if from != nil {
		query = query.Where("created_at >= ?", *from)
	}
	if to != nil {
		query = query.Where("created_at <= ?", *to)
	}
	if err := query.Count(&count).Error; err != nil {
		return 0, fmt.Errorf("failed to count conversations: %w", err)
	}
	return count, nil
}

func (r *conversationRepository) CountByWidgetIDSince(widgetID string, since time.Time) (int64, error) {
	var count int64
	if err := r.db.Model(&models.Conversation{}).
		Where("widget_id = ? AND created_at >= ?", widgetID, since).
		Count(&count).Error; err != nil {
		return 0, fmt.Errorf("failed to count conversations since: %w", err)
	}
	return count, nil
}

func (r *conversationRepository) ListSummariesByWidgetID(widgetID string, from, to *time.Time, limit int) ([]ConversationSummary, error) {
	if limit <= 0 {
		limit = 25
	}

	query := r.db.Table("conversations").
		Select("conversations.id, conversations.session_id, conversations.origin, conversations.created_at, COUNT(messages.id) as message_count").
		Joins("LEFT JOIN messages ON messages.conversation_id = conversations.id").
		Where("conversations.widget_id = ?", widgetID).
		Group("conversations.id").
		Order("conversations.created_at desc").
		Limit(limit)

	if from != nil {
		query = query.Where("conversations.created_at >= ?", *from)
	}
	if to != nil {
		query = query.Where("conversations.created_at <= ?", *to)
	}

	var summaries []ConversationSummary
	if err := query.Scan(&summaries).Error; err != nil {
		return nil, fmt.Errorf("failed to list conversation summaries: %w", err)
	}
	return summaries, nil
}

func (r *conversationRepository) CountByWidgetIDGroupedByOrigin(widgetID string, from, to *time.Time) ([]OriginSessionCount, error) {
	query := r.db.Table("conversations").
		Select("COALESCE(conversations.origin, '') as origin, COUNT(conversations.id) as sessions").
		Where("conversations.widget_id = ?", widgetID).
		Group("conversations.origin").
		Order("sessions desc")
	if from != nil {
		query = query.Where("conversations.created_at >= ?", *from)
	}
	if to != nil {
		query = query.Where("conversations.created_at <= ?", *to)
	}

	var rows []OriginSessionCount
	if err := query.Scan(&rows).Error; err != nil {
		return nil, fmt.Errorf("failed to count sessions by origin: %w", err)
	}
	return rows, nil
}
