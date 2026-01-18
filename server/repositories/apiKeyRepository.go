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
