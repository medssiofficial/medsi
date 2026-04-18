# Webhooks App

`webhooks` is a lean, API-only Next.js service for receiving provider webhooks.

## Scripts

- `bun run dev` - runs locally on port `3003`
- `bun run build` - production build
- `bun run lint` - lint checks
- `bun run check-types` - Next.js + TypeScript checks

## Routes

- `GET /api/health`
- `POST /api/webhooks/stripe`
- `POST /api/webhooks/clerk`
- `POST /api/webhooks/trigger`

## Required Environment Variables

- `STRIPE_WEBHOOK_SECRET`
- `CLERK_WEBHOOK_SECRET`
- `TRIGGER_WEBHOOK_SECRET`

Each route currently includes a minimal payload parser and response contract, ready for provider-specific signature verification and business logic.
