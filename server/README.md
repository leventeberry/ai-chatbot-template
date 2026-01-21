# Backend API (Go)

Gin-based backend for the chatbot platform, with JWT auth, Postgres persistence, optional Redis caching, and service-driven architecture. This README is the single source of truth for backend layout, architecture, and admin tools.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Project Layout](#project-layout)
- [Architecture](#architecture)
- [Admin Tools](#admin-tools)
- [Swagger / API Docs](#swagger--api-docs)
- [Testing](#testing)

## Overview

The backend exposes REST APIs for authentication, chat, analytics, billing, widgets, and user management. The HTTP layer is thin; business logic lives in services, data access is encapsulated in repositories, and an optional Redis cache supports caching and rate limiting.

## Tech Stack

- **Go 1.25.x**
- **Gin** for HTTP routing
- **GORM + PostgreSQL** for persistence
- **Redis (optional)** for caching and distributed rate limiting
- **JWT** for auth tokens
- **Swagger (swaggo)** for API docs

## Quick Start

From repo root:

```bash
make docker-up
```

API: `http://localhost:8080`  
Swagger UI: `http://localhost:8080/swagger/index.html`

## Configuration

Environment variables (loaded from `.env` if present):

```env
# Core
PORT=8080
GIN_MODE=debug

# Auth
JWT_SECRET=your_secret
JWT_EXPIRATION_DAYS=60
AUTH_ENABLED=true

# Rate limiting
RATE_LIMIT_REQUESTS_PER_MINUTE=60
RATE_LIMIT_BURST_SIZE=10

# Database
DB_USER=your_db_user
DB_PASS=your_db_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database
DB_DISABLED=false

# Redis (optional)
REDIS_ENABLED=false
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

Notes:
- If `AUTH_ENABLED=false`, the server allows an empty `JWT_SECRET`.
- If `DB_DISABLED=true`, the DB connection and migrations are skipped.
- If `REDIS_ENABLED=true`, Redis is used for caching + rate limiting; otherwise a no-op cache is used.

## Project Layout

```
server/
├── cache/            # Cache abstraction (Redis + no-op)
├── cmd/seed/         # Seed command entry point
├── config/           # Runtime configuration (env parsing)
├── container/        # Dependency injection container
├── controllers/      # HTTP handlers (thin layer)
├── factories/        # Repository/service factories
├── initializers/     # DB + Redis setup and migrations
├── logger/           # Zerolog setup and helpers
├── middleware/       # Auth, rate limiting, widget checks
├── models/           # GORM models
├── repositories/     # Data access layer
├── routes/           # Router wiring
├── services/         # Business logic layer
├── tokens/           # Token-related types
├── docs/             # Generated Swagger docs
├── schema.sql        # Reference schema
├── main.go           # Application entry point
└── api_test.go       # API test suite
```

## Architecture

**Layers**
- **Controllers**: HTTP request/response, input validation, mapping.
- **Services**: Business logic, auth flows, chat, billing, analytics.
- **Repositories**: Database access via GORM.
- **Cache**: Redis-backed cache with no-op fallback.

**Patterns in use**
- Repository + Service layer
- Factory-based construction
- Dependency injection via `container/`
- Cache-aside for user lookups + rate limiting

**Dependency flow**
1. `main.go` initializes config + connections (`initializers/`).
2. `container/` builds services and repositories via factories.
3. `routes/` wires controllers to Gin routes.
4. `controllers/` call `services/`.
5. `services/` use `repositories/` and `cache/`.

**Cache behavior**
- User cache keys: `user:id:{id}`, `user:email:{email}`
- Rate limit keys: `ratelimit:{ip}`
- TTLs and key patterns are defined in `cache/constants.go`.

## Admin Tools

These tools are available when running via Docker Compose from the repo root.

### Redis Commander

- **URL**: http://localhost:8081  
- **Username**: `admin`  
- **Password**: `admin`

Common tasks:
- Browse keys (`user:id:*`, `user:email:*`, `ratelimit:*`)
- Inspect cached user payloads
- View TTLs and cache activity

### pgAdmin

- **URL**: http://localhost:5050  
- **Email**: `admin@goapi.com`  
- **Password**: `admin`

Connect with:
- Host: `db`
- Port: `5432`
- Database: `goapi`
- Username: `goapi_user`
- Password: `goapi_password`

### Helper commands

```bash
make docker-open-redis-commander
make docker-open-pgadmin
make docker-logs-redis-commander
make docker-logs-pgadmin
```

**Security note:** default credentials are for development only. Change passwords or disable these tools in production.

## Swagger / API Docs

Swagger UI: `http://localhost:8080/swagger/index.html`

Regenerate docs after endpoint changes:

```bash
make swagger
```

## Testing

```bash
make test
```
