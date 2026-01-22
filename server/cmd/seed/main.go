package main

import (
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"os"
	"strings"

	"chatbot_api/infrastructure"
	"chatbot_api/logger"
	"chatbot_api/middleware"
	"chatbot_api/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type SeedUser struct {
	FirstName  string
	LastName   string
	Email      string
	Role       string
	Phone      string
	TenantName string
	WidgetName string
}

func main() {
	infrastructure.Init()
	defer infrastructure.CloseRedis()

	db := infrastructure.DB
	if db == nil {
		logger.Log.Fatal().Msg("Database connection unavailable for seeding")
	}

	defaultPassword := envOrDefault("SEED_DEFAULT_PASSWORD", "password123")
	demoOrigin := envOrDefault("SEED_DEMO_ORIGIN", "http://localhost:3000")
	demoTokenEnv := strings.TrimSpace(os.Getenv("SEED_DEMO_TOKEN"))

	adminEmail := envOrDefault("SEED_ADMIN_EMAIL", "admin@example.com")
	adminFirst := envOrDefault("SEED_ADMIN_FIRST_NAME", "Admin")
	adminLast := envOrDefault("SEED_ADMIN_LAST_NAME", "User")
	adminPhone := envOrDefault("SEED_ADMIN_PHONE", "5555550100")
	adminTenant := envOrDefault("SEED_ADMIN_TENANT", "9b6dc706-cebf-4d62-959c-85fbbbbe8fd0")
	adminWidget := envOrDefault("SEED_ADMIN_WIDGET", "a742a5cb-41e5-49d5-972f-15691be6bfe9")

	seedUsers := []SeedUser{
		{
			FirstName:  adminFirst,
			LastName:   adminLast,
			Email:      adminEmail,
			Role:       "admin",
			Phone:      adminPhone,
			TenantName: adminTenant,
			WidgetName: adminWidget,
		},
		{
			FirstName:  "Avery",
			LastName:   "Stone",
			Email:      "avery@example.com",
			Role:       "user",
			Phone:      "555-0101",
			TenantName: "Avery Co",
			WidgetName: "Avery Support",
		},
		{
			FirstName:  "Jordan",
			LastName:   "Lee",
			Email:      "jordan@example.com",
			Role:       "user",
			Phone:      "555-0102",
			TenantName: "Jordan LLC",
			WidgetName: "Jordan Helper",
		},
		{
			FirstName:  "Riley",
			LastName:   "Park",
			Email:      "riley@example.com",
			Role:       "user",
			Phone:      "555-0103",
			TenantName: "Riley Studio",
			WidgetName: "Riley Assistant",
		},
		{
			FirstName:  "Taylor",
			LastName:   "Morgan",
			Email:      "taylor@example.com",
			Role:       "user",
			Phone:      "555-0104",
			TenantName: "Taylor Labs",
			WidgetName: "Taylor Concierge",
		},
	}

	var adminWidgetID string
	var adminDemoToken string
	for _, seed := range seedUsers {
		tenant, err := findOrCreateTenant(db, seed.TenantName)
		if err != nil {
			logger.Log.Fatal().Err(err).Msg("Failed to upsert tenant")
		}

		widget, err := findOrCreateWidget(db, tenant.ID, seed.WidgetName, seed.Email, adminEmail, demoOrigin)
		if err != nil {
			logger.Log.Fatal().Err(err).Msg("Failed to upsert widget")
		}

		user, created, err := findOrCreateUser(db, seed, tenant.ID, widget.ID, defaultPassword)
		if err != nil {
			logger.Log.Fatal().Err(err).Msg("Failed to upsert user")
		}

		if seed.Role == "admin" {
			adminWidgetID = widget.ID
			demoToken, updated, err := findOrCreateWidgetToken(
				db,
				tenant.ID,
				widget.ID,
				"Demo Token",
				demoTokenEnv,
			)
			if err != nil {
				logger.Log.Fatal().Err(err).Msg("Failed to upsert demo widget token")
			}
			if demoTokenEnv != "" {
				adminDemoToken = demoTokenEnv
			} else if updated {
				adminDemoToken = demoToken
			}
		}

		logger.Log.Info().
			Str("email", user.Email).
			Str("tenant_id", tenant.ID).
			Str("widget_id", widget.ID).
			Bool("created", created).
			Msg("Seeded user")
	}

	if adminWidgetID != "" {
		logger.Log.Info().
			Str("admin_widget_id", adminWidgetID).
			Msg("Use this widget_id for the demo website")
	}
	if adminDemoToken != "" {
		logger.Log.Info().
			Str("demo_widget_token", adminDemoToken).
			Msg("Set NEXT_PUBLIC_WIDGET_TOKEN to this value for the demo website")
	} else if adminWidgetID != "" {
		logger.Log.Info().
			Msg("Demo token already exists; rotate/create a new one via the dashboard if needed")
	}
}

func findOrCreateTenant(db *gorm.DB, name string) (models.Tenant, error) {
	tenant := models.Tenant{}
	if err := db.Where("name = ?", name).First(&tenant).Error; err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return tenant, err
		}
		tenant = models.Tenant{Name: name, Status: "active"}
		if err := db.Create(&tenant).Error; err != nil {
			return tenant, err
		}
	}
	return tenant, nil
}

func findOrCreateWidget(
	db *gorm.DB,
	tenantID string,
	name string,
	ownerEmail string,
	adminEmail string,
	demoOrigin string,
) (models.Widget, error) {
	widget := models.Widget{}
	if err := db.Where("tenant_id = ?", tenantID).First(&widget).Error; err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return widget, err
		}
		allowedOrigin := ""
		if ownerEmail == adminEmail && demoOrigin != "" {
			allowedOrigin = demoOrigin
		}
		widget = models.Widget{
			TenantID:      tenantID,
			Name:          name,
			AllowedOrigin: allowedOrigin,
		}
		if err := db.Create(&widget).Error; err != nil {
			return widget, err
		}
		return widget, nil
	}

	updates := map[string]interface{}{}
	if name != "" && widget.Name != name {
		updates["name"] = name
	}
	if widget.AllowedOrigin == "" && ownerEmail == adminEmail && demoOrigin != "" {
		updates["allowed_origin"] = demoOrigin
	}
	if len(updates) > 0 {
		if err := db.Model(&widget).Updates(updates).Error; err != nil {
			return widget, err
		}
	}
	return widget, nil
}

func findOrCreateUser(
	db *gorm.DB,
	seed SeedUser,
	tenantID string,
	widgetID string,
	defaultPassword string,
) (models.User, bool, error) {
	user := models.User{}
	if err := db.Where("email = ?", seed.Email).First(&user).Error; err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return user, false, err
		}
		hash, err := middleware.HashPassword(defaultPassword)
		if err != nil {
			return user, false, err
		}
		user = models.User{
			FirstName: seed.FirstName,
			LastName:  seed.LastName,
			Email:     seed.Email,
			PassHash:  hash,
			PhoneNum:  seed.Phone,
			Role:      seed.Role,
			TenantID:  tenantID,
			WidgetID:  widgetID,
		}
		if err := db.Create(&user).Error; err != nil {
			return user, false, err
		}
		return user, true, nil
	}

	updates := map[string]interface{}{}
	if user.TenantID == "" {
		updates["tenant_id"] = tenantID
	}
	if user.WidgetID == "" {
		updates["widget_id"] = widgetID
	}
	if user.Role == "" {
		updates["role"] = seed.Role
	}
	if len(updates) > 0 {
		if err := db.Model(&user).Updates(updates).Error; err != nil {
			return user, false, err
		}
	}

	return user, false, nil
}

func findOrCreateWidgetToken(
	db *gorm.DB,
	tenantID string,
	widgetID string,
	name string,
	rawToken string,
) (string, bool, error) {
	apiKey := models.ApiKey{}
	if err := db.Where("widget_id = ? AND name = ?", widgetID, name).
		First(&apiKey).Error; err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return "", false, err
		}

		if rawToken == "" {
			rawToken = uuid.NewString()
		}
		hashed := sha256.Sum256([]byte(rawToken))
		apiKey = models.ApiKey{
			TenantID:  tenantID,
			WidgetID:  widgetID,
			Name:      name,
			HashedKey: hex.EncodeToString(hashed[:]),
		}
		if err := db.Create(&apiKey).Error; err != nil {
			return "", false, err
		}
		return rawToken, true, nil
	}

	if rawToken == "" {
		return "", false, nil
	}

	hashed := sha256.Sum256([]byte(rawToken))
	newHash := hex.EncodeToString(hashed[:])
	if apiKey.HashedKey != newHash {
		if err := db.Model(&apiKey).Update("hashed_key", newHash).Error; err != nil {
			return "", false, err
		}
		return rawToken, true, nil
	}

	return "", false, nil
}

func envOrDefault(key, fallback string) string {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}
	return value
}
