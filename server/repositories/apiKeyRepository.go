package repositories

import (
	"errors"
	"fmt"

	"chatbot_api/models"
	"gorm.io/gorm"
)

// apiKeyRepository implements ApiKeyRepository interface
type apiKeyRepository struct {
	db *gorm.DB
}

// NewApiKeyRepository creates a new instance of ApiKeyRepository
func NewApiKeyRepository(db *gorm.DB) ApiKeyRepository {
	return &apiKeyRepository{
		db: db,
	}
}

func (r *apiKeyRepository) Create(apiKey *models.ApiKey) error {
	if err := r.db.Create(apiKey).Error; err != nil {
		return fmt.Errorf("failed to create api key: %w", err)
	}
	return nil
}

func (r *apiKeyRepository) FindByHashedKey(hashedKey string) (*models.ApiKey, error) {
	var apiKey models.ApiKey
	err := r.db.First(&apiKey, "hashed_key = ?", hashedKey).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrApiKeyNotFound
		}
		return nil, fmt.Errorf("failed to find api key: %w", err)
	}
	return &apiKey, nil
}

func (r *apiKeyRepository) FindByID(id string) (*models.ApiKey, error) {
	var apiKey models.ApiKey
	err := r.db.First(&apiKey, "id = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrApiKeyNotFound
		}
		return nil, fmt.Errorf("failed to find api key by id: %w", err)
	}
	return &apiKey, nil
}

func (r *apiKeyRepository) ListByWidgetID(widgetID string) ([]models.ApiKey, error) {
	var apiKeys []models.ApiKey
	if err := r.db.Where("widget_id = ?", widgetID).Order("created_at DESC").Find(&apiKeys).Error; err != nil {
		return nil, fmt.Errorf("failed to list api keys: %w", err)
	}
	return apiKeys, nil
}

func (r *apiKeyRepository) DeleteByID(id string) error {
	result := r.db.Delete(&models.ApiKey{}, "id = ?", id)
	if result.Error != nil {
		return fmt.Errorf("failed to delete api key: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return ErrApiKeyNotFound
	}
	return nil
}

func (r *apiKeyRepository) DeleteByWidgetID(widgetID string) error {
	if err := r.db.Where("widget_id = ?", widgetID).Delete(&models.ApiKey{}).Error; err != nil {
		return fmt.Errorf("failed to delete api keys for widget: %w", err)
	}
	return nil
}
