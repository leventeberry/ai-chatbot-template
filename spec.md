# Embedded Chat Widget Platform — Implementation Spec (Aligned to Current Codebase)

## 0) Current State (Baseline)
**Frontend**
- Next.js app proxies `/api/*` → `API_BASE_URL` (`next.config.ts`)
- Widget calls:
  - `GET /api/chat/history`
  - `POST /api/chat`

**Backend (GoAPI)**
- `server/routes/index.go` registers chat routes
- `server/services/chatService.go` uses **in-memory history**
- No tenant/session/auth for chat endpoints
- Docker Compose lives at the repo root and builds `server/`

---

## 1) Goals (What We’re Building)
- **Multi-tenant** backend (one platform, many client widgets)
- **Token auth** per widget/tenant (no cookies)
- **Persistent conversations** stored in DB
- **CORS per widget** based on allowed origins
- **Admin provisioning** (create tenant/widget/token)

---

## 2) Data Model (New DB Tables)

### 2.1 Core Tables
**tenants**
- `id` (uuid, pk)
- `name`
- `status` (active/suspended)
- `created_at`, `updated_at`

**widgets**
- `id` (uuid, pk)
- `tenant_id` (fk)
- `name`
- `allowed_origins` (json array)
- `config` (json)
- `created_at`, `updated_at`

**conversations**
- `id` (uuid, pk)
- `tenant_id` (fk)
- `widget_id` (fk)
- `session_id` (string)
- `created_at`, `updated_at`

**messages**
- `id` (uuid, pk)
- `tenant_id` (fk)
- `conversation_id` (fk)
- `role` (user|assistant|system)
- `content`
- `tokens` (optional)
- `created_at`

**api_keys** (or `tokens`)
- `id` (uuid)
- `tenant_id` (fk)
- `widget_id` (fk)
- `hashed_key`
- `last_used_at`
- `created_at`

---

## 3) Backend Implementation Plan (GoAPI)

### Phase 1 — Tenant/Auth Context
**Goal:** Every request has a verified tenant/widget identity.

1. Add **token auth middleware**
   - Accept `Authorization: Bearer <token>`
   - Validate token → extract `tenant_id`, `widget_id`
   - Attach to `context`

2. Add **token validation service**
   - Verify signature or hashed API key
   - Add expiry support

3. Wire middleware into chat routes:
   - `router.Group("/api")` → middleware → chat endpoints

---

### Phase 2 — Persistence
**Goal:** Replace in-memory `ChatService` with DB persistence.

1. Add models + migrations for:
   - Tenant, Widget, Conversation, Message
2. Add repositories:
   - `ConversationRepository`
   - `MessageRepository`
3. Update `ChatService`:
   - `GetHistory(ctx, tenant_id, session_id)`
   - `SendMessage(ctx, tenant_id, widget_id, session_id, message)`
   - Persist messages before/after OpenAI call

---

### Phase 3 — Sessions
**Goal:** Support user sessions for conversation history.

1. Add endpoint:
   - `POST /api/widget/session`
   - Input: `widget_id`
   - Output: `session_id`
2. Widget flow:
   - On open: create session → use session_id for history + chat

---

### Phase 4 — Widget Config + CORS
**Goal:** Only allow embeds from approved origins.

1. Store allowed origins in `widgets.allowed_origins`
2. Add CORS middleware:
   - Validate `Origin` header against widget config
3. Fallback to `CORS_ALLOW_ORIGINS` env var (global)

---

### Phase 5 — Admin Provisioning
**Goal:** You can create tenants/widgets/tokens.

1. Add admin endpoints (internal only):
   - `POST /admin/tenants`
   - `POST /admin/widgets`
   - `POST /admin/tokens`
2. Return token once and store hashed token
3. Optional: simple admin auth or CLI script

---

## 4) Frontend Updates (Widget)

### Required changes
- Add props:
  - `token`, `widgetId`, `apiBaseUrl`
- Store and reuse `session_id`
- Use `Authorization: Bearer <token>` on all API requests

### Example flow
1. On open → `POST /api/widget/session`
2. `GET /api/chat/history?session_id=...`
3. `POST /api/chat` with `message + session_id`

---

## 5) Environment Variables

### Backend
- `AI_INTEGRATIONS_OPENAI_API_KEY`
- `AI_INTEGRATIONS_OPENAI_MODEL`
- `AI_INTEGRATIONS_OPENAI_BASE_URL`
- `CORS_ALLOW_ORIGINS`
- `JWT_SECRET` (if JWT is used)
- `DB_*` (when DB enabled)

### Frontend
- `API_BASE_URL` (in Next.js)
- Widget config passed via props

---

## 6) Testing Checklist
- Token validation works
- Tenant isolation is enforced
- Conversation history is persisted
- CORS blocks invalid origins
- Widget works cross-site
- Rate limits apply per tenant

---

## 7) Deliverables
1. DB schema + migrations
2. Auth middleware + token service
3. Persistent chat service
4. Widget session endpoint
5. Updated widget props + flow
6. Admin provisioning endpoints

---

## 8) Immediate Next Step (Recommended)
Implement **Phase 1** (token auth + tenant context) since everything else depends on it.
