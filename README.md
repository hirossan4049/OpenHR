# OpenHR

OpenHR is a talent management app for hackathon/side-project teams. Members can publish rich profiles, manage skills, and apply to projects with role-based access control and internationalization.

## Features
- Profile hub with bio, grade, contact, GitHub link, portfolio, articles, and hackathon history
- Skill master with logo search, alias handling, suggestion flow, and admin approval/merge tools
- Role- and tag-based access control (ADMIN / MEMBER / VIEWER), viewer-hiding rules, and admin consoles
- Project navigation (dashboard, project list/detail, “My Projects”) with create flow for eligible roles
- Auth via NextAuth (Discord/GitHub/Google) and session-aware UI elements
- Internationalized UI (next-intl) with message catalogs in `messages/`

## Tech Stack
- Next.js 15, TypeScript, App Router, next-intl
- tRPC v11, React Query, SuperJSON
- Prisma (SQLite default) with NextAuth + @auth/prisma-adapter
- Tailwind CSS + shadcn/ui, lucide-react
- Testing: Jest (unit) and Playwright (e2e)

## Getting Started
1) Install dependencies (Bun recommended):
```bash
bun install
# or
npm install
```
2) Copy env template and fill in secrets:
```bash
cp .env.example .env
```
Required keys: `AUTH_SECRET` plus provider IDs/secrets for Discord, GitHub, Google. `DATABASE_URL` defaults to SQLite; point it to Postgres/MySQL if needed.

3) Generate Prisma client and apply schema:
```bash
bun db:generate
bun db:push
# optional: seed initial data if provided
bun db:seed
```

4) Run the app:
```bash
bun dev
```
Then open the locale-aware root (e.g., `http://localhost:3000/en` or `/ja`).

## Scripts
- `bun dev` — start dev server
- `bun build` / `bun preview` — production build + start
- `bun lint` — oxlint
- `bun typecheck` — TypeScript no-emit
- `bun test` — Jest unit tests
- `bun run e2e:install` then `bun run test:e2e` — Playwright e2e
- `bun db:push` / `bun db:migrate` / `bun db:studio` — database workflow

## Project Notes
- RBAC and tag management docs: `docs/ROLE_AND_TAG_MANAGEMENT.md`
- Skill system docs: `docs/SKILL_MASTER_FEATURE.md`, `docs/IMPLEMENTATION_COMPLETE.md`
- Profile feature docs: `docs/PROFILE_FEATURE.md`
- Discord integration notes: `docs/DISCORD_FEATURE.md`
- Auth details: `docs/AUTHENTICATION.md`

## Troubleshooting
- Missing migrations/seed: rerun `bun db:push` and `bun db:seed`.
- Auth errors: confirm provider secrets and `AUTH_SECRET`, and restart dev server after changes.
- Playwright: run `bun run e2e:install` once per machine to fetch browsers.
