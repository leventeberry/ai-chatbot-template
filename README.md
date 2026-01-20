This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development servers:

```bash
npm run dev
# in another terminal
npm run dev:go
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The Next.js app proxies `/api/*` requests to the Go server. You can override the
backend base URL with `API_BASE_URL` when deploying.

`npm run dev:go` starts the GoAPI backend in widget-only mode (no database,
widget auth disabled) on port 3000.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)
to automatically optimize and load Inter + Outfit.

## Docker

Build and run the full stack from the repo root:

```bash
docker compose up --build
```

For local configuration, copy `env.example` to `.env` and edit as needed:

```bash
cp env.example .env
```

Run the dev override (hot reload + volume mounts):

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

Start admin tools (pgAdmin + Redis Commander) only when needed:

```bash
docker compose --profile tools up --build
```

Or use the Makefile shortcuts:

```bash
make docker-up
make docker-dev
```

The root `Makefile` also includes GoAPI helpers (run from repo root):

```bash
make install
make run
make build
make test
make swagger
```

The web app is available at [http://localhost:3000](http://localhost:3000). The
Go API is exposed at [http://localhost:8080](http://localhost:8080).

Admin tools:
- Redis Commander: [http://localhost:8081](http://localhost:8081) (admin/admin)
- pgAdmin: [http://localhost:5050](http://localhost:5050) (admin@goapi.com/admin)

Set `AI_INTEGRATIONS_OPENAI_API_KEY` (and optionally
`AI_INTEGRATIONS_OPENAI_BASE_URL` and `AI_INTEGRATIONS_OPENAI_MODEL`) in your
environment or a `.env` file before running Docker so the Go server can reach
OpenAI.

Global assistant branding:
- `Chexi AI Assistant` is the default assistant name.
- Set `NEXT_PUBLIC_CHEXI_AVATAR_URL` to use a global avatar image for the widget.

Widget auth (Phase 1):
- Set `WIDGET_AUTH_DISABLED=false` to enforce token auth.
- Provide `WIDGET_TOKEN`, `WIDGET_TENANT_ID`, and `WIDGET_ID` in the API env.
Admin provisioning (Phase 5):
- Set `ADMIN_TOKEN` and pass it in `X-Admin-Token` for `/api/admin/*`.

## Stripe development setup

Install the Stripe CLI (WSL2 apt):

```bash
curl -s https://packages.stripe.dev/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg
echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.dev/stripe-cli-debian-local stable main" | sudo tee -a /etc/apt/sources.list.d/stripe.list
sudo apt update
sudo apt install stripe
```

Authenticate the CLI:

```bash
stripe login
```

Sanity check the CLI (demo product + price):

```bash
make stripe-check
```

Stripe keys are required for local testing. Copy `env.example` to `.env` and set:

- `STRIPE_SECRET_KEY` (server-side, test secret key)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (client-side, test publishable key)

Do not commit secrets to git.

If apt install is blocked, you can run the CLI via Docker:

```bash
docker run --rm -it stripe/stripe-cli:latest
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
