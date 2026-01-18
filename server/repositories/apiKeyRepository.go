package repositories

import (
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
