package controllers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strconv"

	"chatbot_api/logger"
	"chatbot_api/models"
	"chatbot_api/repositories"

	"github.com/gin-gonic/gin"
	stripe "github.com/stripe/stripe-go/v84"
	"github.com/stripe/stripe-go/v84/billing/meterevent"
	"github.com/stripe/stripe-go/v84/checkout/session"
	"github.com/stripe/stripe-go/v84/customer"
)

type CreateCustomerResponse struct {
	StripeCustomerID string `json:"stripe_customer_id"`
}

type CheckoutSessionInput struct {
	ReturnURL string `json:"return_url" binding:"required"`
}

type CheckoutSessionResponse struct {
	SessionID    string `json:"session_id"`
	ClientSecret string `json:"client_secret"`
}

type UsageEventInput struct {
	EventID   string `json:"event_id" binding:"required"`
	Tokens    int64  `json:"tokens" binding:"required,min=1"`
	Timestamp *int64 `json:"timestamp,omitempty"`
}

type UsageEventResponse struct {
	EventID string `json:"event_id"`
}

// CreateStripeCustomer creates or returns a Stripe customer for the tenant.
// @Summary      Create Stripe customer
// @Description  Creates a Stripe customer for the authenticated tenant if missing
// @Tags         billing
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  CreateCustomerResponse
// @Failure      400  {object}  map[string]string
// @Failure      401  {object}  map[string]string
// @Failure      404  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /api/v1/dashboard/billing/customer [post]
func CreateStripeCustomer(tenantRepo repositories.TenantRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		tenant, err := loadTenantFromContext(c, tenantRepo)
		if err != nil {
			return
		}

		if tenant.StripeCustomerID != "" {
			c.JSON(http.StatusOK, CreateCustomerResponse{StripeCustomerID: tenant.StripeCustomerID})
			return
		}

		if err := ensureStripeKey(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		params := &stripe.CustomerParams{
			Name: stripe.String(tenant.Name),
		}
		params.AddMetadata("tenant_id", tenant.ID)
		if userID := contextUserID(c); userID != "" {
			params.AddMetadata("user_id", userID)
		}

		cust, err := customer.New(params)
		if err != nil {
			logger.Log.Error().Err(err).Msg("Failed to create Stripe customer")
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create Stripe customer"})
			return
		}

		tenant.StripeCustomerID = cust.ID
		if err := tenantRepo.Update(tenant); err != nil {
			logger.Log.Error().Err(err).Msg("Failed to persist Stripe customer ID")
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save Stripe customer ID"})
			return
		}

		c.JSON(http.StatusOK, CreateCustomerResponse{StripeCustomerID: cust.ID})
	}
}

// CreateCheckoutSession creates a subscription Checkout Session for embedded/custom UI.
// @Summary      Create Checkout Session
// @Description  Creates a subscription Checkout Session and returns a client secret
// @Tags         billing
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        request  body      CheckoutSessionInput  true  "Checkout session request"
// @Success      200      {object}  CheckoutSessionResponse
// @Failure      400      {object}  map[string]string
// @Failure      401      {object}  map[string]string
// @Failure      404      {object}  map[string]string
// @Failure      500      {object}  map[string]string
// @Router       /api/v1/dashboard/billing/checkout-session [post]
func CreateCheckoutSession(tenantRepo repositories.TenantRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input CheckoutSessionInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
			return
		}

		tenant, err := loadTenantFromContext(c, tenantRepo)
		if err != nil {
			return
		}

		if err := ensureStripeKey(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		licensePriceID := os.Getenv("STRIPE_LICENSE_PRICE_ID")
		usagePriceID := os.Getenv("STRIPE_USAGE_PRICE_ID")
		if licensePriceID == "" || usagePriceID == "" {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Stripe price IDs are not configured"})
			return
		}

		if tenant.StripeCustomerID == "" {
			cust, err := createStripeCustomerForTenant(tenant, c)
			if err != nil {
				return
			}
			tenant.StripeCustomerID = cust.ID
			if err := tenantRepo.Update(tenant); err != nil {
				logger.Log.Error().Err(err).Msg("Failed to persist Stripe customer ID")
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save Stripe customer ID"})
				return
			}
		}

		params := &stripe.CheckoutSessionParams{
			Customer: stripe.String(tenant.StripeCustomerID),
			Mode:     stripe.String(string(stripe.CheckoutSessionModeSubscription)),
			UIMode:   stripe.String(string(stripe.CheckoutSessionUIModeCustom)),
			ReturnURL: stripe.String(input.ReturnURL),
			ClientReferenceID: stripe.String(tenant.ID),
			LineItems: []*stripe.CheckoutSessionLineItemParams{
				{
					Price:    stripe.String(licensePriceID),
					Quantity: stripe.Int64(1),
				},
				{
					Price:    stripe.String(usagePriceID),
					Quantity: stripe.Int64(1),
				},
			},
			SubscriptionData: &stripe.CheckoutSessionSubscriptionDataParams{
				Metadata: map[string]string{
					"tenant_id": tenant.ID,
				},
			},
		}

		checkoutSession, err := session.New(params)
		if err != nil {
			logger.Log.Error().Err(err).Msg("Failed to create Stripe checkout session")
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create checkout session"})
			return
		}

		c.JSON(http.StatusOK, CheckoutSessionResponse{
			SessionID:    checkoutSession.ID,
			ClientSecret: checkoutSession.ClientSecret,
		})
	}
}

// ReportUsageEvent posts a metered usage event to Stripe.
// @Summary      Report usage event
// @Description  Sends a metered usage event to Stripe for the authenticated tenant
// @Tags         billing
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        request  body      UsageEventInput  true  "Usage event payload"
// @Success      200      {object}  UsageEventResponse
// @Failure      400      {object}  map[string]string
// @Failure      401      {object}  map[string]string
// @Failure      404      {object}  map[string]string
// @Failure      500      {object}  map[string]string
// @Router       /api/v1/dashboard/billing/usage-events [post]
func ReportUsageEvent(tenantRepo repositories.TenantRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input UsageEventInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
			return
		}

		tenant, err := loadTenantFromContext(c, tenantRepo)
		if err != nil {
			return
		}

		if tenant.StripeCustomerID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Stripe customer not configured for tenant"})
			return
		}

		if err := ensureStripeKey(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		eventName := os.Getenv("STRIPE_METER_EVENT_NAME")
		if eventName == "" {
			eventName = "tokens_used"
		}

		payload := map[string]string{
			"stripe_customer_id": tenant.StripeCustomerID,
			"value":              strconv.FormatInt(input.Tokens, 10),
		}

		params := &stripe.BillingMeterEventParams{
			EventName:  stripe.String(eventName),
			Identifier: stripe.String(input.EventID),
			Payload:    payload,
		}
		if input.Timestamp != nil {
			params.Timestamp = input.Timestamp
		}
		params.SetIdempotencyKey(input.EventID)

		_, err = meterevent.New(params)
		if err != nil {
			logger.Log.Error().Err(err).Str("event_id", input.EventID).Msg("Failed to report usage event")
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to report usage event"})
			return
		}

		logger.Log.Info().
			Str("tenant_id", tenant.ID).
			Str("event_id", input.EventID).
			Int64("tokens", input.Tokens).
			Msg("Reported usage event to Stripe")

		c.JSON(http.StatusOK, UsageEventResponse{EventID: input.EventID})
	}
}

// HandleStripeWebhook processes incoming Stripe webhook events.
// @Summary      Stripe webhook
// @Description  Validates and handles Stripe webhook events
// @Tags         billing
// @Accept       json
// @Produce      json
// @Success      200  {object}  map[string]bool
// @Failure      400  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /api/v1/stripe/webhook [post]
func HandleStripeWebhook(tenantRepo repositories.TenantRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		payload, err := io.ReadAll(c.Request.Body)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Unable to read webhook payload"})
			return
		}

		secret := os.Getenv("STRIPE_WEBHOOK_SECRET")
		if secret == "" {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Stripe webhook secret not configured"})
			return
		}

		sigHeader := c.GetHeader("Stripe-Signature")
		event, err := stripe.ConstructEvent(payload, sigHeader, secret)
		if err != nil {
			logger.Log.Warn().Err(err).Msg("Invalid Stripe webhook signature")
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid webhook signature"})
			return
		}

		switch event.Type {
		case "checkout.session.completed":
			var session stripe.CheckoutSession
			if err := json.Unmarshal(event.Data.Raw, &session); err != nil {
				logger.Log.Error().Err(err).Msg("Failed to parse checkout session webhook")
				break
			}
			handleCheckoutSessionCompleted(tenantRepo, &session)
		case "invoice.paid", "invoice.payment_failed":
			var invoice stripe.Invoice
			if err := json.Unmarshal(event.Data.Raw, &invoice); err != nil {
				logger.Log.Error().Err(err).Msg("Failed to parse invoice webhook")
				break
			}
			handleInvoiceUpdate(tenantRepo, &invoice, string(event.Type))
		case "customer.subscription.updated", "customer.subscription.deleted":
			var subscription stripe.Subscription
			if err := json.Unmarshal(event.Data.Raw, &subscription); err != nil {
				logger.Log.Error().Err(err).Msg("Failed to parse subscription webhook")
				break
			}
			handleSubscriptionUpdate(tenantRepo, &subscription)
		default:
			logger.Log.Debug().Str("event_type", string(event.Type)).Msg("Unhandled Stripe webhook event")
		}

		c.JSON(http.StatusOK, gin.H{"received": true})
	}
}

func loadTenantFromContext(c *gin.Context, tenantRepo repositories.TenantRepository) (*models.Tenant, error) {
	tenantIDVal, ok := c.Get("tenantId")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Tenant not found in context"})
		return nil, fmt.Errorf("tenant context missing")
	}
	tenantID, ok := tenantIDVal.(string)
	if !ok || tenantID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid tenant context"})
		return nil, fmt.Errorf("invalid tenant context")
	}

	tenant, err := tenantRepo.FindByID(tenantID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tenant not found"})
		return nil, err
	}
	return tenant, nil
}

func contextUserID(c *gin.Context) string {
	userIDVal, ok := c.Get("userID")
	if !ok {
		return ""
	}
	userID, ok := userIDVal.(string)
	if !ok {
		return ""
	}
	return userID
}

func ensureStripeKey() error {
	if os.Getenv("STRIPE_SECRET_KEY") == "" {
		return fmt.Errorf("Stripe secret key is not configured")
	}
	stripe.Key = os.Getenv("STRIPE_SECRET_KEY")
	return nil
}

func createStripeCustomerForTenant(tenant *models.Tenant, c *gin.Context) (*stripe.Customer, error) {
	params := &stripe.CustomerParams{
		Name: stripe.String(tenant.Name),
	}
	params.AddMetadata("tenant_id", tenant.ID)
	if userID := contextUserID(c); userID != "" {
		params.AddMetadata("user_id", userID)
	}

	cust, err := customer.New(params)
	if err != nil {
		logger.Log.Error().Err(err).Msg("Failed to create Stripe customer")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create Stripe customer"})
		return nil, err
	}
	return cust, nil
}

func handleCheckoutSessionCompleted(tenantRepo repositories.TenantRepository, session *stripe.CheckoutSession) {
	if session.Customer == nil || session.Customer.ID == "" {
		logger.Log.Warn().Msg("Checkout session missing customer")
		return
	}

	tenant, err := tenantRepo.FindByStripeCustomerID(session.Customer.ID)
	if err != nil {
		logger.Log.Warn().Err(err).Str("customer_id", session.Customer.ID).Msg("Tenant not found for checkout session")
		return
	}

	if session.Subscription != nil {
		tenant.StripeSubscriptionID = session.Subscription.ID
		tenant.StripeSubscriptionStatus = string(session.Subscription.Status)
	} else {
		tenant.StripeSubscriptionStatus = "active"
	}

	if err := tenantRepo.Update(tenant); err != nil {
		logger.Log.Error().Err(err).Msg("Failed to update tenant after checkout session")
	}
}

func handleInvoiceUpdate(tenantRepo repositories.TenantRepository, invoice *stripe.Invoice, eventType string) {
	if invoice.Customer == nil || invoice.Customer.ID == "" {
		logger.Log.Warn().Msg("Invoice webhook missing customer")
		return
	}

	tenant, err := tenantRepo.FindByStripeCustomerID(invoice.Customer.ID)
	if err != nil {
		logger.Log.Warn().Err(err).Str("customer_id", invoice.Customer.ID).Msg("Tenant not found for invoice webhook")
		return
	}

	status := string(invoice.Status)
	if eventType == "invoice.payment_failed" && status == "" {
		status = "past_due"
	}
	if status != "" {
		tenant.StripeSubscriptionStatus = status
	}
	if invoice.Parent != nil && invoice.Parent.SubscriptionDetails != nil && invoice.Parent.SubscriptionDetails.Subscription != nil {
		tenant.StripeSubscriptionID = invoice.Parent.SubscriptionDetails.Subscription.ID
	}

	if err := tenantRepo.Update(tenant); err != nil {
		logger.Log.Error().Err(err).Msg("Failed to update tenant after invoice webhook")
	}
}

func handleSubscriptionUpdate(tenantRepo repositories.TenantRepository, subscription *stripe.Subscription) {
	if subscription.Customer == nil || subscription.Customer.ID == "" {
		logger.Log.Warn().Msg("Subscription webhook missing customer")
		return
	}

	tenant, err := tenantRepo.FindByStripeCustomerID(subscription.Customer.ID)
	if err != nil {
		logger.Log.Warn().Err(err).Str("customer_id", subscription.Customer.ID).Msg("Tenant not found for subscription webhook")
		return
	}

	tenant.StripeSubscriptionID = subscription.ID
	tenant.StripeSubscriptionStatus = string(subscription.Status)

	if err := tenantRepo.Update(tenant); err != nil {
		logger.Log.Error().Err(err).Msg("Failed to update tenant after subscription webhook")
	}
}
