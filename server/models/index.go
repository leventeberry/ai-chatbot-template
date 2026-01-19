package models

import "time"

type User struct {
    ID        int       `gorm:"primaryKey" json:"user_id"`
	TenantID  string    `gorm:"type:uuid;index" json:"tenant_id"`
	WidgetID  string    `gorm:"type:uuid;index" json:"widget_id"`
    FirstName string    `json:"first_name"`
    LastName  string    `json:"last_name"`
    Email     string    `gorm:"uniqueIndex;not null" json:"email"`
    PassHash  string    `json:"-"` // Excluded from JSON responses for security
    PhoneNum  string    `json:"phone_number"`
    Role      string    `json:"role"`
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
}
