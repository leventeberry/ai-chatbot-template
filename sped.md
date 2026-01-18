# Client Dashboard Spec (MVP)

## Purpose
Provide a secure, self-serve dashboard for clients to configure their widgets, manage tokens, and review usage. The dashboard should reflect current capabilities and expose the configuration and analytics that the backend already supports or can support with minimal additions.

## Audience
Client admins who embed the widget on their websites.

## Current MVP Capabilities (from existing code)
- Widget configuration stored on `Widget` (`name`, `allowed_origins`, `config`).
- Widget auth via API keys (token create/list/rotate/revoke).
- Widget config fetch via `/api/widget/config`.
- Chat history persisted by tenant/widget/session.
- Token usage audit (`last_used_at`).
- CORS enforcement by widget allowed origins.

## Core Dashboard Sections

### 1) Overview
**Goal:** quick status and embed readiness.
- Widget status (active/inactive).
- Allowed origins summary (count + list).
- Token status (active tokens count, last used).
- Recent activity (last chat, last token use).

### 2) Widget Settings
**Goal:** configure widget behavior and appearance.
- **Name**: display name in widget header.
- **Theme**:
  - `headerBackground`, `headerText`
  - `buttonBackground`, `buttonText`
  - future: message bubble colors, font size, avatar toggle
- **Branding**:
  - upload logo image (stored URL)
  - show logo in header + optional bubble avatar
- **Placement**:
  - position (bottom-right, bottom-left)
  - offset (x/y)
- **Greeting**:
  - default welcome message
  - optional initial prompt
- **Behavior**:
  - open on load (bool)
  - show online indicator (bool)
- **Allowed Origins**:
  - list editor (comma or JSON list)
  - test current domain
- **Save**: PATCH `/api/admin/widgets/:id` (already supported).

### 3) Embed & Tokens
**Goal:** provide embed snippet and secure token management.
- **Embed snippet**:
  - Widget script/React usage
  - Required headers: `Authorization: Bearer <token>`
- **Tokens**:
  - list tokens (name, created_at, last_used_at)
  - create token
  - rotate tokens
  - revoke token
- **Safety tips**:
  - tokens are secrets
  - rotate if leaked

### 4) Analytics (MVP)
**Goal:** basic usage insights (available from existing data).
- **Messages**: total messages, user vs assistant count
- **Conversations**: total sessions, active sessions today
- **Token usage**: last_used_at by token
- **Time filters**: last 7 / 30 / 90 days

### 5) Conversations (Optional MVP+)
**Goal:** view recent chat sessions.
- session list (session_id, created_at, message count)
- view messages by session
- search by keyword

## Data Requirements
**Existing:**
- `Widget` table
- `ApiKey` table with `last_used_at`
- `Conversation` and `Message` tables

**Derived:**
- message counts per widget (aggregate)
- session counts per widget (aggregate)
- token activity (from `last_used_at`)

## API Endpoints Needed (MVP)

### Already Available
- `PATCH /api/admin/widgets/:id` (update widget settings)
- `GET /api/admin/widgets/:id/tokens` (list tokens)
- `POST /api/admin/widgets/:id/tokens` (create token)
- `POST /api/admin/widgets/:id/tokens/rotate` (rotate tokens)
- `DELETE /api/admin/widgets/:id/tokens/:tokenId` (revoke token)
- `GET /api/widget/config` (public config for widget)

### To Add (Analytics)
- `GET /api/admin/widgets/:id/analytics?from=&to=`
  - counts: messages, sessions, last_used_at distribution
- `GET /api/admin/widgets/:id/conversations?from=&to=&limit=`
  - recent sessions (id, created_at, message_count)
- `GET /api/admin/conversations/:id/messages`
  - messages by session

## UI/UX Notes
- Mobile friendly layout (stacked sections, sticky save).
- Toasts for success/error.
- Clear warning when saving allowed origins (CORS enforcement).
- No token plaintext displayed after creation (only once on create).

## MVP Milestones
1. **Dashboard Shell**
   - `/dashboard` route with nav and sections
2. **Widget Settings Form**
   - PATCH widget config
3. **Token Management**
   - list/create/rotate/revoke
4. **Basic Analytics**
   - message + session counts

## Step-by-Step Implementation
1. **Dashboard Shell**
   - Create `/dashboard` layout and navigation
   - Add sections: Overview, Widget Settings, Tokens, Analytics
2. **Auth Gate**
   - Enforce JWT auth for dashboard routes
   - Redirect to `/` if no token found
3. **Widget Settings**
   - Load current widget config
   - Build form for theme, branding, allowed origins
   - Save via `PATCH /api/admin/widgets/:id`
4. **Branding Upload**
   - Add image upload UI
   - Store logo URL in `config` JSON
   - Render logo in widget header/avatar
5. **Token Management**
   - List tokens (`GET /api/admin/widgets/:id/tokens`)
   - Create token
   - Rotate/revoke tokens
6. **Analytics**
   - Add API endpoints for message/session counts
   - Display totals and trends
7. **Conversations (Optional MVP+)**
   - List sessions and messages per session

## Open Questions
- Do we enforce login for dashboard via JWT or continue static admin token? yes enforce
- Multi-tenant: should one dashboard manage multiple widgets? no, one widget per account
- Are per-domain analytics required in MVP? yes

