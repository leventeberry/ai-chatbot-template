package controllers

import (
	"crypto/sha256"
	"encoding/hex"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"chatbot_api/models"
	"chatbot_api/repositories"
)

type CreateTenantRequest struct {
	Name string `json:"name"`
}

type CreateWidgetRequest struct {
	TenantID      string `json:"tenant_id"`
	Name          string `json:"name"`
	AllowedOrigin string `json:"allowed_origin"`
	Config        string `json:"config"`
}

type WidgetResponse struct {
	ID            string `json:"id"`
	TenantID      string `json:"tenant_id"`
	Name          string `json:"name"`
	AllowedOrigin string `json:"allowed_origin"`
	Config        string `json:"config"`
	CreatedAt     string `json:"created_at"`
	UpdatedAt     string `json:"updated_at"`
}

type CreateWidgetTokenRequest struct {
	Name string `json:"name"`
}

type UpdateWidgetRequest struct {
	Name          *string `json:"name"`
	AllowedOrigin *string `json:"allowed_origin"`
	Config        *string `json:"config"`
}

type WidgetTokenResponse struct {
	Token string `json:"token"`
}

type WidgetTokenSummary struct {
	ID         string  `json:"id"`
	Name       string  `json:"name"`
	CreatedAt  string  `json:"created_at"`
	LastUsedAt *string `json:"last_used_at,omitempty"`
}

// CreateTenant provisions a new tenant.
// @Summary      Create tenant
// @Description  Creates a new tenant for widget provisioning
// @Tags         admin
// @Accept       json
// @Produce      json
// @Param        request  body      CreateTenantRequest  true  "Tenant details"
// @Success      201      {object}  models.Tenant
// @Failure      400      {object}  map[string]string
// @Failure      401      {object}  map[string]string
// @Router       /api/v1/admin/tenants [post]
func CreateTenant(tenantRepo repositories.TenantRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input CreateTenantRequest
		if err := c.ShouldBindJSON(&input); err != nil || input.Name == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "name is required"})
			return
		}

		tenant := &models.Tenant{Name: input.Name}
		if err := tenantRepo.Create(tenant); err != nil {
			handleServiceError(c, err)
			return
		}

		c.JSON(http.StatusCreated, tenant)
	}
}

// CreateWidget provisions a new widget for a tenant.
// @Summary      Create widget
// @Description  Creates a new widget linked to a tenant
// @Tags         admin
// @Accept       json
// @Produce      json
// @Param        request  body      CreateWidgetRequest  true  "Widget details"
// @Success      201      {object}  models.Widget
// @Failure      400      {object}  map[string]string
// @Failure      401      {object}  map[string]string
// @Router       /api/v1/admin/widgets [post]
func CreateWidget(widgetRepo repositories.WidgetRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input CreateWidgetRequest
		if err := c.ShouldBindJSON(&input); err != nil || input.TenantID == "" || input.Name == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "tenant_id and name are required"})
			return
		}

		widget := &models.Widget{
			TenantID:      input.TenantID,
			Name:          input.Name,
			AllowedOrigin: input.AllowedOrigin,
			Config:        input.Config,
		}

		if existing, err := widgetRepo.FindByTenantID(input.TenantID); err == nil && existing != nil {
			c.JSON(http.StatusConflict, gin.H{"error": "widget already exists for tenant"})
			return
		} else if err != nil && err != repositories.ErrWidgetNotFound {
			handleServiceError(c, err)
			return
		}

		if err := widgetRepo.Create(widget); err != nil {
			handleServiceError(c, err)
			return
		}

		c.JSON(http.StatusCreated, widget)
	}
}

// GetWidget returns a widget by ID.
// @Summary      Get widget
// @Description  Fetch widget details
// @Tags         admin
// @Accept       json
// @Produce      json
// @Param        id       path      string               true  "Widget ID"
// @Success      200      {object}  WidgetResponse
// @Failure      400      {object}  map[string]string
// @Failure      401      {object}  map[string]string
// @Failure      404      {object}  map[string]string
// @Router       /api/v1/admin/widgets/{id} [get]
func GetWidget(widgetRepo repositories.WidgetRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		widgetID := c.Param("id")
		if widgetID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "widget id is required"})
			return
		}

		widget, err := widgetRepo.FindByID(widgetID)
		if err != nil {
			if err == repositories.ErrWidgetNotFound {
				c.JSON(http.StatusNotFound, gin.H{"error": "widget not found"})
				return
			}
			handleServiceError(c, err)
			return
		}

		c.JSON(http.StatusOK, WidgetResponse{
			ID:            widget.ID,
			TenantID:      widget.TenantID,
			Name:          widget.Name,
			AllowedOrigin: widget.AllowedOrigin,
			Config:        widget.Config,
			CreatedAt:     widget.CreatedAt.Format(time.RFC3339),
			UpdatedAt:     widget.UpdatedAt.Format(time.RFC3339),
		})
	}
}

// UpdateWidget updates widget configuration fields.
// @Summary      Update widget
// @Description  Updates widget name, allowed origins, or config
// @Tags         admin
// @Accept       json
// @Produce      json
// @Param        id       path      string               true  "Widget ID"
// @Param        request  body      UpdateWidgetRequest  true  "Widget updates"
// @Success      200      {object}  models.Widget
// @Failure      400      {object}  map[string]string
// @Failure      401      {object}  map[string]string
// @Failure      404      {object}  map[string]string
// @Router       /api/v1/admin/widgets/{id} [patch]
func UpdateWidget(widgetRepo repositories.WidgetRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		widgetID := c.Param("id")
		if widgetID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "widget id is required"})
			return
		}

		var input UpdateWidgetRequest
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
			return
		}

		widget, err := widgetRepo.FindByID(widgetID)
		if err != nil {
			if err == repositories.ErrWidgetNotFound {
				c.JSON(http.StatusNotFound, gin.H{"error": "widget not found"})
				return
			}
			handleServiceError(c, err)
			return
		}

		if input.Name != nil {
			widget.Name = *input.Name
		}
		if input.AllowedOrigin != nil {
			widget.AllowedOrigin = *input.AllowedOrigin
		}
		if input.Config != nil {
			widget.Config = *input.Config
		}

		if err := widgetRepo.Update(widget); err != nil {
			handleServiceError(c, err)
			return
		}

		c.JSON(http.StatusOK, widget)
	}
}

// CreateWidgetToken issues a token for a widget and returns the plaintext token once.
// @Summary      Create widget token
// @Description  Creates a widget token and returns the plaintext token once
// @Tags         admin
// @Accept       json
// @Produce      json
// @Param        id       path      string                 true  "Widget ID"
// @Param        request  body      CreateWidgetTokenRequest true  "Token details"
// @Success      201      {object}  WidgetTokenResponse
// @Failure      400      {object}  map[string]string
// @Failure      401      {object}  map[string]string
// @Failure      404      {object}  map[string]string
// @Router       /api/v1/admin/widgets/{id}/tokens [post]
func CreateWidgetToken(
	widgetRepo repositories.WidgetRepository,
	apiKeyRepo repositories.ApiKeyRepository,
) gin.HandlerFunc {
	return func(c *gin.Context) {
		widgetID := c.Param("id")
		if widgetID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "widget id is required"})
			return
		}

		var input CreateWidgetTokenRequest
		if err := c.ShouldBindJSON(&input); err != nil || input.Name == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "name is required"})
			return
		}

		widget, err := widgetRepo.FindByID(widgetID)
		if err != nil {
			if err == repositories.ErrWidgetNotFound {
				c.JSON(http.StatusNotFound, gin.H{"error": "widget not found"})
				return
			}
			handleServiceError(c, err)
			return
		}

		rawToken := uuid.NewString()
		hashed := sha256.Sum256([]byte(rawToken))
		apiKey := &models.ApiKey{
			TenantID:  widget.TenantID,
			WidgetID:  widget.ID,
			Name:      input.Name,
			HashedKey: hex.EncodeToString(hashed[:]),
		}

		if err := apiKeyRepo.Create(apiKey); err != nil {
			handleServiceError(c, err)
			return
		}

		c.JSON(http.StatusCreated, WidgetTokenResponse{Token: rawToken})
	}
}

// ListWidgetTokens lists token metadata for a widget.
// @Summary      List widget tokens
// @Description  Lists token metadata for a widget (no plaintext tokens)
// @Tags         admin
// @Accept       json
// @Produce      json
// @Param        id   path      string  true  "Widget ID"
// @Success      200  {array}   WidgetTokenSummary
// @Failure      400  {object}  map[string]string
// @Failure      401  {object}  map[string]string
// @Router       /api/v1/admin/widgets/{id}/tokens [get]
func ListWidgetTokens(apiKeyRepo repositories.ApiKeyRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		widgetID := c.Param("id")
		if widgetID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "widget id is required"})
			return
		}

		keys, err := apiKeyRepo.ListByWidgetID(widgetID)
		if err != nil {
			handleServiceError(c, err)
			return
		}

		summaries := make([]WidgetTokenSummary, len(keys))
		for i, key := range keys {
			var lastUsed *string
			if key.LastUsedAt != nil {
				formatted := key.LastUsedAt.Format(time.RFC3339)
				lastUsed = &formatted
			}
			summaries[i] = WidgetTokenSummary{
				ID:         key.ID,
				Name:       key.Name,
				CreatedAt:  key.CreatedAt.Format(time.RFC3339),
				LastUsedAt: lastUsed,
			}
		}

		c.JSON(http.StatusOK, summaries)
	}
}

// RevokeWidgetToken removes a token by ID for a widget.
// @Summary      Revoke widget token
// @Description  Revokes a widget token by ID
// @Tags         admin
// @Accept       json
// @Produce      json
// @Param        id       path      string  true  "Widget ID"
// @Param        tokenId  path      string  true  "Token ID"
// @Success      204
// @Failure      400  {object}  map[string]string
// @Failure      401  {object}  map[string]string
// @Failure      404  {object}  map[string]string
// @Router       /api/v1/admin/widgets/{id}/tokens/{tokenId} [delete]
func RevokeWidgetToken(apiKeyRepo repositories.ApiKeyRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		widgetID := c.Param("id")
		tokenID := c.Param("tokenId")
		if widgetID == "" || tokenID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "widget id and token id are required"})
			return
		}

		apiKey, err := apiKeyRepo.FindByID(tokenID)
		if err != nil {
			if err == repositories.ErrApiKeyNotFound {
				c.JSON(http.StatusNotFound, gin.H{"error": "token not found"})
				return
			}
			handleServiceError(c, err)
			return
		}
		if apiKey.WidgetID != widgetID {
			c.JSON(http.StatusNotFound, gin.H{"error": "token not found"})
			return
		}

		if err := apiKeyRepo.DeleteByID(tokenID); err != nil {
			handleServiceError(c, err)
			return
		}

		c.Status(http.StatusNoContent)
	}
}

// RotateWidgetTokens revokes all existing tokens and issues a new one.
// @Summary      Rotate widget tokens
// @Description  Deletes existing tokens for a widget and returns a new token
// @Tags         admin
// @Accept       json
// @Produce      json
// @Param        id       path      string                 true  "Widget ID"
// @Param        request  body      CreateWidgetTokenRequest true  "Token details"
// @Success      201      {object}  WidgetTokenResponse
// @Failure      400      {object}  map[string]string
// @Failure      401      {object}  map[string]string
// @Failure      404      {object}  map[string]string
// @Router       /api/v1/admin/widgets/{id}/tokens/rotate [post]
func RotateWidgetTokens(
	widgetRepo repositories.WidgetRepository,
	apiKeyRepo repositories.ApiKeyRepository,
) gin.HandlerFunc {
	return func(c *gin.Context) {
		widgetID := c.Param("id")
		if widgetID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "widget id is required"})
			return
		}

		var input CreateWidgetTokenRequest
		if err := c.ShouldBindJSON(&input); err != nil || input.Name == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "name is required"})
			return
		}

		widget, err := widgetRepo.FindByID(widgetID)
		if err != nil {
			if err == repositories.ErrWidgetNotFound {
				c.JSON(http.StatusNotFound, gin.H{"error": "widget not found"})
				return
			}
			handleServiceError(c, err)
			return
		}

		if err := apiKeyRepo.DeleteByWidgetID(widget.ID); err != nil {
			handleServiceError(c, err)
			return
		}

		rawToken := uuid.NewString()
		hashed := sha256.Sum256([]byte(rawToken))
		apiKey := &models.ApiKey{
			TenantID:  widget.TenantID,
			WidgetID:  widget.ID,
			Name:      input.Name,
			HashedKey: hex.EncodeToString(hashed[:]),
		}

		if err := apiKeyRepo.Create(apiKey); err != nil {
			handleServiceError(c, err)
			return
		}

		c.JSON(http.StatusCreated, WidgetTokenResponse{Token: rawToken})
	}
}
