package cache

import (
	"context"
	"time"

	"chatbot_api/models"
)

// UserCache defines the interface for user caching operations.
type UserCache interface {
	GetUserByID(ctx context.Context, id int) (*models.User, error)
	SetUserByID(ctx context.Context, id int, user *models.User, ttl time.Duration) error
	GetUserByEmail(ctx context.Context, email string) (*models.User, error)
	SetUserByEmail(ctx context.Context, email string, user *models.User, ttl time.Duration) error
	DeleteUserByID(ctx context.Context, id int) error
	DeleteUserByEmail(ctx context.Context, email string) error
	DeleteUser(ctx context.Context, id int, email string) error // Deletes both ID and email keys
}

// RateLimiter defines the interface for rate limiting operations.
type RateLimiter interface {
	IncrementRateLimit(ctx context.Context, key string, window time.Duration) (int, error)
	GetRateLimit(ctx context.Context, key string) (int, error)
	ResetRateLimit(ctx context.Context, key string) error
}
