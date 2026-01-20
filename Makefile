SHELL := /bin/sh

.PHONY: help build run test test-coverage clean install deps swagger swag seed docker-seed \
	docker-dev docker-dev-build docker-up docker-down docker-down-volumes docker-logs \
	docker-logs-api docker-logs-db docker-logs-redis docker-logs-redis-commander docker-logs-pgadmin \
	docker-restart docker-rebuild docker-ps docker-shell-api docker-shell-db docker-shell-redis \
	docker-open-redis-commander docker-open-pgadmin dev dev-docker setup prod-build all docker-all \
	stripe-version stripe-check

# Variables
APP_NAME=goapi
SERVER_DIR=server
DOCKER_COMPOSE=docker compose
GO=go
SWAG=swag

# Colors for output
GREEN=\033[0;32m
YELLOW=\033[1;33m
NC=\033[0m # No Color

help: ## Show this help message
	@echo "$(GREEN)Available commands:$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-24s$(NC) %s\n", $$1, $$2}'
	@echo ""

# Local Development (Go API)
install: ## Install Go dependencies
	@echo "$(GREEN)Installing dependencies...$(NC)"
	@cd $(SERVER_DIR) && $(GO) mod download
	@cd $(SERVER_DIR) && $(GO) mod tidy

deps: install ## Alias for install

run: ## Run the API locally
	@echo "$(GREEN)Running API...$(NC)"
	@cd $(SERVER_DIR) && $(GO) run main.go

build: ## Build the API binary
	@echo "$(GREEN)Building API...$(NC)"
	@cd $(SERVER_DIR) && $(GO) build -o $(APP_NAME) main.go
	@echo "$(GREEN)Build complete: $(SERVER_DIR)/$(APP_NAME)$(NC)"

test: ## Run API tests
	@echo "$(GREEN)Running tests...$(NC)"
	@cd $(SERVER_DIR) && $(GO) test -v ./...

test-coverage: ## Run API tests with coverage
	@echo "$(GREEN)Running tests with coverage...$(NC)"
	@cd $(SERVER_DIR) && $(GO) test -v -coverprofile=coverage.out ./...
	@cd $(SERVER_DIR) && $(GO) tool cover -html=coverage.out -o coverage.html
	@echo "$(GREEN)Coverage report generated: $(SERVER_DIR)/coverage.html$(NC)"

clean: ## Clean API build artifacts
seed: ## Seed database with sample users
	@echo "$(GREEN)Seeding database...$(NC)"
	@cd $(SERVER_DIR) && $(GO) run ./cmd/seed

	@echo "$(GREEN)Cleaning build artifacts...$(NC)"
	@rm -f $(SERVER_DIR)/$(APP_NAME)
	@rm -f $(SERVER_DIR)/$(APP_NAME).exe
	@rm -f $(SERVER_DIR)/coverage.out $(SERVER_DIR)/coverage.html
	@echo "$(GREEN)Clean complete$(NC)"

# Swagger Documentation
swagger: ## Generate Swagger documentation
	@echo "$(GREEN)Generating Swagger documentation...$(NC)"
	@cd $(SERVER_DIR) && which $(SWAG) > /dev/null || ($(GO) install github.com/swaggo/swag/cmd/swag@latest && echo "$(GREEN)swag installed$(NC)")
	@cd $(SERVER_DIR) && $(SWAG) init
	@echo "$(GREEN)Swagger docs generated in $(SERVER_DIR)/docs/$(NC)"

swag: ## Install swag CLI tool
	@echo "$(GREEN)Installing swag CLI...$(NC)"
	@$(GO) install github.com/swaggo/swag/cmd/swag@latest
	@echo "$(GREEN)swag installed$(NC)"

# Docker Commands
docker-dev: ## Start Docker dev compose (if configured)
	$(DOCKER_COMPOSE) -f docker-compose.yml -f docker-compose.dev.yml up

docker-dev-build: ## Start Docker dev compose with build
	$(DOCKER_COMPOSE) -f docker-compose.yml -f docker-compose.dev.yml up --build

docker-up: ## Start Docker containers
	@echo "$(GREEN)Starting Docker containers...$(NC)"
	$(DOCKER_COMPOSE) up --build

docker-down: ## Stop Docker containers
	@echo "$(GREEN)Stopping Docker containers...$(NC)"
	$(DOCKER_COMPOSE) down

docker-down-volumes: ## Stop Docker containers and remove volumes
	@echo "$(YELLOW)Stopping containers and removing volumes...$(NC)"
	$(DOCKER_COMPOSE) down -v

docker-logs: ## View Docker container logs
	$(DOCKER_COMPOSE) logs -f

docker-logs-api: ## View API container logs only
	$(DOCKER_COMPOSE) logs -f api

docker-logs-db: ## View database container logs only
	$(DOCKER_COMPOSE) logs -f db

docker-logs-redis: ## View Redis container logs only
	$(DOCKER_COMPOSE) logs -f redis

docker-logs-redis-commander: ## View Redis Commander logs
	$(DOCKER_COMPOSE) logs -f redis-commander

docker-logs-pgadmin: ## View pgAdmin logs
	$(DOCKER_COMPOSE) logs -f pgadmin

docker-restart: ## Restart Docker containers
	$(DOCKER_COMPOSE) restart

docker-rebuild: ## Rebuild and restart Docker containers
	$(DOCKER_COMPOSE) up -d --build

docker-ps: ## Show running Docker containers
	$(DOCKER_COMPOSE) ps

docker-shell-api: ## Open shell in API container
	$(DOCKER_COMPOSE) exec api sh

docker-shell-db: ## Open PostgreSQL shell in database container
	$(DOCKER_COMPOSE) exec db psql -U goapi_user -d goapi

docker-shell-redis: ## Open Redis CLI in Redis container
	$(DOCKER_COMPOSE) exec redis redis-cli

docker-seed: ## Seed database inside Docker API container
	$(DOCKER_COMPOSE) exec api go run ./cmd/seed

docker-open-redis-commander: ## Open Redis Commander in browser
	@echo "$(GREEN)Opening Redis Commander at http://localhost:8081$(NC)"
	@echo "$(YELLOW)Username: admin$(NC)"
	@echo "$(YELLOW)Password: admin$(NC)"
	@$(if $(shell which start 2>/dev/null),start http://localhost:8081,echo "Please open http://localhost:8081 in your browser")

docker-open-pgadmin: ## Open pgAdmin in browser
	@echo "$(GREEN)Opening pgAdmin at http://localhost:5050$(NC)"
	@echo "$(YELLOW)Email: admin@goapi.com$(NC)"
	@echo "$(YELLOW)Password: admin$(NC)"
	@$(if $(shell which start 2>/dev/null),start http://localhost:5050,echo "Please open http://localhost:5050 in your browser")

# Workflow Helpers
dev: install run ## Install dependencies and run locally

dev-docker: docker-up docker-logs-api ## Start Docker and follow API logs

setup: install swagger ## Full setup: install deps and generate Swagger docs
	@echo "$(GREEN)Setup complete!$(NC)"
	@echo "$(GREEN)Run 'make run' to start the API$(NC)"
	@echo "$(GREEN)Or 'make docker-up' to start with Docker$(NC)"

prod-build: clean build ## Production build: clean and build
	@echo "$(GREEN)Production build complete: $(SERVER_DIR)/$(APP_NAME)$(NC)"

all: clean install swagger build ## Clean, install, generate docs, and build
	@echo "$(GREEN)All tasks complete!$(NC)"

docker-all: docker-down docker-up ## Full Docker rebuild: down, build, up
	@echo "$(GREEN)Docker stack ready!$(NC)"

# Stripe CLI helpers
stripe-version: ## Show Stripe CLI version
	@stripe --version

stripe-check: ## Create demo Stripe product and price
	@echo "$(GREEN)Creating demo Stripe product and price...$(NC)"
	@PRODUCT_ID=$$(stripe products create --name="Demo Product" --description="Created with Stripe CLI" | python -c 'import json,sys;print(json.load(sys.stdin)["id"])'); \
	stripe prices create --unit-amount=3000 --currency=usd --product=$$PRODUCT_ID
