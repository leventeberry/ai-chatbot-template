package repositories

import "errors"

// Repository errors
var (
	ErrUserNotFound         = errors.New("user not found")
	ErrUserExists           = errors.New("user already exists")
	ErrConversationNotFound = errors.New("conversation not found")
	ErrWidgetNotFound       = errors.New("widget not found")
)
