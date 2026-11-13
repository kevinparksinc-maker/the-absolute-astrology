# Bible Believers Astrology

A TypeScript astrology and interpretation app: a dark, interactive observatory for natal charts, transit readings, and AI-guided chart interpretation, including Horary charts.

## Stack

- **Client:** React 19 + Vite, framer-motion, recharts
- **Server:** Express + Node, tRPC for API calls
- **Astronomy:** `sweph` (ephemeris / planetary calculations)
- **Database:** drizzle-orm
- **Tests:** Vitest

## Project layout

```text
client/    React frontend (pages, components, hooks, tRPC client helpers)
server/    Express backend: chart calculation, horary flows, interpretation prompts, DB access
shared/    Shared types and helpers (including horary logic)
drizzle/   DB schema and migrations
docs/      Design guidance (mobile visual system)
```

Key server files: `astronomy.ts` (chart calculation), `astrologyCore.ts` (core astrology logic), `master-interpreter.ts` (interpretation prompts), `host.ts` (host persona), `routers.ts` (API routes).

## Getting started

```bash
pnpm install
pnpm dev
```

## Scripts

```bash
pnpm check    # type check
pnpm test     # run tests
pnpm build    # production build
pnpm start    # run the production build
```

A `Dockerfile` is included for containerized runs.

## Production deployment

The production container runs the compiled server with `pnpm start`, listens on the
platform-provided `PORT` (defaulting to `3000`), and exposes `/health` as an
unauthenticated readiness endpoint. The published frontend is built into
`dist/public`; the server handles `/api/*` and the SPA fallback serves client routes.

## Configuration

This app needs environment variables (database, auth, LLM). Create a local `.env` file; it is git-ignored and should never be committed.


### Independent account sign-in

`/account` provides email/password registration and sign-in without the original OAuth provider. Configure a persistent MySQL `DATABASE_URL` and a unique production `JWT_SECRET` (at least 32 characters). Apply the existing Drizzle schema to a new database before launch. The credentials table is created idempotently on the first account request; users and saved-record tables use the existing schema. Passwords are salted with scrypt, sessions use HttpOnly cookies, and registration never attaches a password to an existing OAuth identity by matching its email.

Production does not create temporary account/chart records when database configuration is absent. Original OAuth sign-in remains available for existing accounts when its provider is configured. Old device profiles are preserved and can be explicitly imported after signing in. Device profile storage is scoped by account; signing out clears cached private API results.

The primary index is `/explore`. Readings use `/reading`, `/reading/depth`, and `/reading/evidence`. Energy uses `/energy`, `/energy/contacts`, `/forecast`, and `/energy/consultation`. The floating AI guide is mounted once in the shared shell and keeps its conversation across client-side navigation, resetting when the active birth profile changes.

### Groq interpreter setup

Set `GROQ_API_KEY` in the server environment (Render → service → Environment), then redeploy. Never put this secret in a `VITE_` variable or commit it. `GROQ_MODEL` defaults to `openai/gpt-oss-120b`. All shared AI interpretation requests use Groq when its key is set, even if older Claude/Gemini model hints or keys remain. Groq errors never trigger a paid-provider fallback. XYZ calculations, Canon retrieval and synthesis prompts are unchanged. `system.providerStatus` reports `groq` as the interpreter provider.

The Groq free plan has request and token limits; it is not unlimited inference. Large chart dossiers and life stories may exceed the account's per-request/minute allowance. Such requests return explicit errors; no evidence is silently removed and incomplete readings are rejected. See https://console.groq.com/docs/rate-limits for current limits. A live reading must be verified after adding the account key.
