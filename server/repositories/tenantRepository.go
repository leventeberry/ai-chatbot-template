package repositories

import (
	"errors"
	"fmt"

	"chatbot_api/models"
	"gorm.io/gorm"
)

// tenantRepository implements TenantRepository interface
type tenantRepository struct {
	db *gorm.DB
}

// NewTenantRepository creates a new instance of TenantRepository
func NewTenantRepository(db *gorm.DB) TenantRepository {
	return &tenantRepository{
		db: db,
	}
}

func (r *tenantRepository) FindByID(id string) (*models.Tenant, error) {
	var tenant models.Tenant
	err := r.db.First(&tenant, "id = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrTenantNotFound
		}
		return nil, fmt.Errorf("failed to find tenant by ID %s: %w", id, err)
	}
	return &tenant, nil
}

func (r *tenantRepository) Create(tenant *models.Tenant) error {
	if err := r.db.Create(tenant).Error; err != nil {
		return fmt.Errorf("failed to create tenant: %w", err)
	}
	return nil
}
