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

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)
to automatically optimize and load Inter + Outfit.

## Docker

Build and run the full stack:

```bash
docker compose up --build
```

The web app is available at [http://localhost:3000](http://localhost:3000). The
Go API is exposed at [http://localhost:3001](http://localhost:3001).

Set `AI_INTEGRATIONS_OPENAI_API_KEY` (and optionally
`AI_INTEGRATIONS_OPENAI_BASE_URL`) in your environment or a `.env` file before
running Docker so the Go server can reach OpenAI.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
