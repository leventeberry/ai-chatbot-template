## Model Update Plan (Step-by-Step)

Goal: enforce **one widget per tenant** and use a **global "Chexi AI Assistant" persona**.

### 1) Align model intent
- Confirm: `Tenant` represents a business, `Widget` is the single configurable assistant for that tenant.
- Persona is global and not stored per tenant.

### 2) Enforce one widget per tenant (DB constraint)
- Add a unique constraint on `widgets.tenant_id`.
- Result: each tenant can only have one widget row.

### 3) Update GORM model tags
- Update `Widget.TenantID` to use `uniqueIndex` instead of only `index`.
- This keeps the ORM aligned with the DB constraint.

### 4) Migration plan
- Check for existing tenants with multiple widgets.
- If any exist, decide the winner and delete/merge the rest before adding the unique constraint.

### 5) Application-level safeguards
- In create widget logic, reject creation if a widget already exists for the tenant.
- In update widget logic, ensure tenant ownership is validated.

### 6) Update codebase for model changes
- Revisit repositories, services, controllers, and DTOs that assume multiple widgets per tenant.
- Replace any "list widgets for tenant" flows with "get widget for tenant" where appropriate.
- Ensure any reads of persona/assistant metadata use the global config, not per-tenant data.

### 6) Global persona configuration
- Define persona values in configuration (e.g., name="Chexi AI Assistant", avatar URL, short bio).
- Use the same persona for all tenants in widget UI and responses.

### 7) Optional: persona future-proofing
- If you expect future customization, create a `persona` table with a single row.
- Otherwise keep the persona in config constants.

### 8) Update seed/demo data
- Ensure demo seeding creates only one widget per tenant.
- Populate widget config with tenant-specific branding while persona stays global.

### 9) Add tests
- Add a test for unique widget per tenant.
- Add a test that persona data is global and not tenant-specific.
