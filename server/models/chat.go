package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Tenant struct {
	ID        string    `gorm:"type:uuid;primaryKey" json:"id"`
	Name      string    `gorm:"not null" json:"name"`
	Status    string    `gorm:"not null;default:active" json:"status"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Widget struct {
	ID             string    `gorm:"type:uuid;primaryKey" json:"id"`
	TenantID       string    `gorm:"type:uuid;index;not null" json:"tenant_id"`
	Name           string    `gorm:"not null" json:"name"`
	AllowedOrigins string    `gorm:"type:text" json:"allowed_origins"`
	Config         string    `gorm:"type:text" json:"config"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

type ApiKey struct {
	ID         string     `gorm:"type:uuid;primaryKey" json:"id"`
	TenantID   string     `gorm:"type:uuid;index;not null" json:"tenant_id"`
	WidgetID   string     `gorm:"type:uuid;index;not null" json:"widget_id"`
	HashedKey  string     `gorm:"not null" json:"-"`
	Name       string     `gorm:"not null" json:"name"`
	CreatedAt  time.Time  `json:"created_at"`
	LastUsedAt *time.Time `json:"last_used_at,omitempty"`
}

type Conversation struct {
	ID        string    `gorm:"type:uuid;primaryKey" json:"id"`
	TenantID  string    `gorm:"type:uuid;index;not null" json:"tenant_id"`
	WidgetID  string    `gorm:"type:uuid;index;not null" json:"widget_id"`
	SessionID string    `gorm:"index;not null" json:"session_id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Message struct {
	ID             string    `gorm:"type:uuid;primaryKey" json:"id"`
	TenantID       string    `gorm:"type:uuid;index;not null" json:"tenant_id"`
	ConversationID string    `gorm:"type:uuid;index;not null" json:"conversation_id"`
	Role           string    `gorm:"not null" json:"role"`
	Content        string    `gorm:"type:text;not null" json:"content"`
	Tokens         *int      `json:"tokens,omitempty"`
	CreatedAt      time.Time `json:"created_at"`
}

func (t *Tenant) BeforeCreate(_ *gorm.DB) error {
	if t.ID == "" {
		t.ID = uuid.NewString()
	}
	return nil
}

func (w *Widget) BeforeCreate(_ *gorm.DB) error {
	if w.ID == "" {
		w.ID = uuid.NewString()
	}
	return nil
}

func (c *Conversation) BeforeCreate(_ *gorm.DB) error {
	if c.ID == "" {
		c.ID = uuid.NewString()
	}
	return nil
}

func (m *Message) BeforeCreate(_ *gorm.DB) error {
	if m.ID == "" {
		m.ID = uuid.NewString()
	}
	return nil
}

func (a *ApiKey) BeforeCreate(_ *gorm.DB) error {
	if a.ID == "" {
		a.ID = uuid.NewString()
	}
	return nil
}
