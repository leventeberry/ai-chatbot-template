package repositories

import "time"

type ConversationSummary struct {
	ID           string
	SessionID    string
	Origin       string
	CreatedAt    time.Time
	MessageCount int64
}

type OriginSessionCount struct {
	Origin   string
	Sessions int64
}

type OriginMessageCount struct {
	Origin   string
	Messages int64
}
