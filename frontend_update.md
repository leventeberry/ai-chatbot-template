# Dashboard Frontend Updates Brainstorm

Notes below focus on data views + config options per dashboard page.
MVP priorities are called out explicitly.

## Overview (`/dashboard`, `/dashboard/overview`)
- MVP: KPI tiles (sessions, messages, last chat), recent activity, top sources/domains.
- MVP filters: date range.
- Later: CSAT/deflection tiles, widget selector, env/timezone, pin/arrange tiles, anomaly alerts.
- Step-by-step:
  1. Add KPI tiles for sessions/messages/last chat with empty states.
  2. Add recent activity list (last N chats or events).
  3. Add top sources/domains list with counts.
  4. Add date range picker and wire to all widgets.
  5. Add loading + error states for each widget.

## Analytics (`/dashboard/analytics`)
- MVP: time-series charts (sessions, messages), per-domain table.
- MVP filters: date range.
- Later: token spend, funnel, response time/latency, compare ranges, channel/device/locale, export CSV, saved views, metric definitions.
- Step-by-step:
  1. Add date range picker with default (30d).
  2. Add sessions/messages time-series charts with shared x-axis.
  3. Add per-domain table with sessions/messages columns.
  4. Add chart/table empty states (no data).
  5. Add download CSV action (optional MVP+).

## Conversations (`/dashboard/conversations`)
- MVP: conversation list + transcript view, message count, timestamps, origin.
- MVP filters: date, status (open/resolved).
- Later: tags, sentiment, summary, language/channel, ratings, agent/bot, redaction rules, auto-summary, column config.
- Step-by-step:
  1. Add list of conversations with basic metadata.
  2. Add transcript panel that loads on selection.
  3. Add date filter + status filter chips.
  4. Add pagination or infinite scroll (pick one).
  5. Add empty states for list + transcript.

## Tokens (`/dashboard/tokens`)
- MVP: active token list with last used, create/rotate/revoke, copy token.
- MVP config: allowed domains.
- Later: scopes/permissions, expiration policy, rotation history, per-token usage, misuse alerts.
- Step-by-step:
  1. Add create/rotate token form with success state.
  2. Add token list with last used + revoke action.
  3. Add copy-to-clipboard UX for new tokens.
  4. Add allowed domains input and save action.
  5. Add revoke confirmation dialog.

## Settings (`/dashboard/settings`)
- MVP: theme colors, greeting message, placement, behavior toggles, branding logo.
- MVP integration: embed snippet + allowed origins management.
- Later: font selection, offline message, KB link, CSP guidance, advanced preview.
- Step-by-step:
  1. Add widget appearance fields (colors, logo, placement).
  2. Add greeting + behavior toggles (open on load, online).
  3. Add live preview panel (optional MVP+).
  4. Add embed snippet with copy action.
  5. Add allowed origins input + save.

## Billing (`/dashboard/billing`)
- MVP: current plan, usage vs quota, invoice list, payment method.
- MVP config: upgrade/downgrade, billing email.
- Later: tax/VAT ID, auto-top-up, usage caps, overage/failed payment alerts.
- Step-by-step:
  1. Add current plan card with limits.
  2. Add usage vs quota meter.
  3. Add invoice list table with download links.
  4. Add payment method section with update CTA.
  5. Add billing email setting.

## Account (`/dashboard/account`)
- MVP: profile info, password change, 2FA toggle.
- MVP admin: team list + invite (if multi-user from day one).
- Later: session management, OAuth connections, roles/permissions, audit log, API access view.
- Step-by-step:
  1. Add profile info form (name, avatar).
  2. Add password change form with validation.
  3. Add 2FA toggle + setup flow.
  4. Add team list + invite action (if enabled).
  5. Add security status summary.

## Notifications (`/dashboard/notifications`)
- MVP: channel toggles (email), basic notification history.
- MVP config: error/spike thresholds.
- Later: slack/webhooks, quiet hours, test notifications, per-user/org settings, webhook status.
- Step-by-step:
  1. Add channel toggles for email notifications.
  2. Add thresholds for error/spike alerts.
  3. Add recent notification history list.
  4. Add test notification action (optional MVP+).
  5. Add empty state messaging.

## Support (`/dashboard/support`)
- MVP: support contact form, help resources/FAQ link.
- Later: ticket history, SLA status, attach logs toggle, live chat, system status.
- Step-by-step:
  1. Add contact form with name/email/subject/message.
  2. Add success state after submit.
  3. Add help links (FAQ, docs, status).
  4. Add file attach toggle (optional MVP+).
  5. Add ticket history section (later).
