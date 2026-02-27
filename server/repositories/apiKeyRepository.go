package repositories

import (
	"errors"
	"fmt"
	"time"

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

// Create inserts a new API key into the database
// @Summary      Create API key
// @Description  Creates a new API key for a widget
// @Tags         api-keys
// @Accept       json
// @Produce      json
// @Param        apiKey body models.ApiKey true "API key to create"
// @Success      200    {object}    nil  "API key created successfully"
// @Failure      400    {object}    map[string]string  "Invalid request"
// @Failure      500    {object}    map[string]string  "Server error"
// @Router       /api-keys [post]
func (r *apiKeyRepository) Create(apiKey *models.ApiKey) error {
	if err := r.db.Create(apiKey).Error; err != nil {
		return fmt.Errorf("failed to create api key: %w", err)
	}
	return nil
}

// FindByHashedKey retrieves an API key by its hashed key
// @Summary      Find API key by hashed key
// @Description  Retrieves an API key by its hashed key
// @Tags         api-keys
// @Accept       json
// @Produce      json
// @Param        hashedKey string true "Hashed API key"
// @Success      200    {object}    models.ApiKey  "API key found"
// @Failure      404    {object}    map[string]string  "API key not found"
// @Failure      500    {object}    map[string]string  "Server error"
// @Router       /api-keys/hashed/{hashedKey} [get]
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

// FindByID retrieves an API key by its ID
// @Summary      Find API key by ID
// @Description  Retrieves an API key by its ID
// @Tags         api-keys
// @Accept       json
// @Produce      json
// @Param        id string true "API key ID"
// @Success      200    {object}    models.ApiKey  "API key found"
// @Failure      404    {object}    map[string]string  "API key not found"
// @Failure      500    {object}    map[string]string  "Server error"
// @Router       /api-keys/{id} [get]
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

// ListByWidgetID retrieves all API keys for a widget
// @Summary      List API keys by widget ID
// @Description  Retrieves all API keys for a widget
// @Tags         api-keys
// @Accept       json
// @Produce      json
// @Param        widgetID string true "Widget ID"
// @Success      200    {object}    []models.ApiKey  "API keys found"
// @Failure      404    {object}    map[string]string  "API keys not found"
// @Failure      500    {object}    map[string]string  "Server error"
// @Router       /api-keys/widget/{widgetID} [get]
func (r *apiKeyRepository) ListByWidgetID(widgetID string) ([]models.ApiKey, error) {
	var apiKeys []models.ApiKey
	if err := r.db.Where("widget_id = ?", widgetID).Order("created_at DESC").Find(&apiKeys).Error; err != nil {
		return nil, fmt.Errorf("failed to list api keys: %w", err)
	}
	return apiKeys, nil
}

// DeleteByID deletes an API key by its ID
// @Summary      Delete API key by ID
// @Description  Deletes an API key by its ID
// @Tags         api-keys
// @Accept       json
// @Produce      json
// @Param        id string true "API key ID"
// @Success      200    {object}    nil  "API key deleted successfully"
// @Failure      404    {object}    map[string]string  "API key not found"
// @Failure      500    {object}    map[string]string  "Server error"
// @Router       /api-keys/{id} [delete]
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

// DeleteByWidgetID deletes all API keys for a widget
// @Summary      Delete API keys by widget ID
// @Description  Deletes all API keys for a widget
// @Tags         api-keys
// @Accept       json
// @Produce      json
// @Param        widgetID string true "Widget ID"
// @Success      200    {object}    nil  "API keys deleted successfully"
// @Failure      404    {object}    map[string]string  "API keys not found"
// @Failure      500    {object}    map[string]string  "Server error"
// @Router       /api-keys/widget/{widgetID} [delete]
func (r *apiKeyRepository) DeleteByWidgetID(widgetID string) error {
	if err := r.db.Where("widget_id = ?", widgetID).Delete(&models.ApiKey{}).Error; err != nil {
		return fmt.Errorf("failed to delete api keys for widget: %w", err)
	}
	return nil
}

// TouchLastUsedAt updates the last used at timestamp for an API key
// @Summary      Touch last used at timestamp
// @Description  Updates the last used at timestamp for an API key
// @Tags         api-keys
// @Accept       json
// @Produce      json
// @Param        id string true "API key ID"
// @Success      200    {object}    nil  "Last used at timestamp updated successfully"
func (r *apiKeyRepository) TouchLastUsedAt(id string) error {
	now := time.Now().UTC()
	if err := r.db.Model(&models.ApiKey{}).Where("id = ?", id).Update("last_used_at", &now).Error; err != nil {
		return fmt.Errorf("failed to update last_used_at: %w", err)
	}
	return nil
}
