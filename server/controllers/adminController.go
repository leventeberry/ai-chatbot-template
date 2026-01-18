package controllers

import (
	"crypto/sha256"
	"encoding/hex"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"chatbot_api/models"
	"chatbot_api/repositories"
)

type CreateTenantRequest struct {
	Name string `json:"name"`
}

type CreateWidgetRequest struct {
	TenantID       string `json:"tenant_id"`
	Name           string `json:"name"`
	AllowedOrigins string `json:"allowed_origins"`
	Config         string `json:"config"`
}

type CreateWidgetTokenRequest struct {
	Name string `json:"name"`
}

type UpdateWidgetRequest struct {
	Name           *string `json:"name"`
	AllowedOrigins *string `json:"allowed_origins"`
	Config         *string `json:"config"`
}

type WidgetTokenResponse struct {
	Token string `json:"token"`
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
// @Router       /api/admin/tenants [post]
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
// @Router       /api/admin/widgets [post]
func CreateWidget(widgetRepo repositories.WidgetRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input CreateWidgetRequest
		if err := c.ShouldBindJSON(&input); err != nil || input.TenantID == "" || input.Name == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "tenant_id and name are required"})
			return
		}

		widget := &models.Widget{
			TenantID:       input.TenantID,
			Name:           input.Name,
			AllowedOrigins: input.AllowedOrigins,
			Config:         input.Config,
		}

		if err := widgetRepo.Create(widget); err != nil {
			handleServiceError(c, err)
			return
		}

		c.JSON(http.StatusCreated, widget)
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
// @Router       /api/admin/widgets/{id} [patch]
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
		if input.AllowedOrigins != nil {
			widget.AllowedOrigins = *input.AllowedOrigins
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
// @Router       /api/admin/widgets/{id}/tokens [post]
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
