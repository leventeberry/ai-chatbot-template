package repositories

import (
	"errors"
	"fmt"

	"chatbot_api/models"
	"gorm.io/gorm"
)

// widgetRepository implements WidgetRepository interface
type widgetRepository struct {
	db *gorm.DB
}

// NewWidgetRepository creates a new instance of WidgetRepository
func NewWidgetRepository(db *gorm.DB) WidgetRepository {
	return &widgetRepository{
		db: db,
	}
}

func (r *widgetRepository) FindByID(id string) (*models.Widget, error) {
	var widget models.Widget
	err := r.db.First(&widget, "id = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrWidgetNotFound
		}
		return nil, fmt.Errorf("failed to find widget by ID %s: %w", id, err)
	}
	return &widget, nil
}
