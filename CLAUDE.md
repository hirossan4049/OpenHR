# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tech Stack & Package Management

This is a **T3 Stack** project using:
- **Package Manager**: `bun` (NOT npm/yarn) - use `bun install`, `bun add`, `bun run`
- **Framework**: Next.js 15 with App Router
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js with multiple providers (GitHub, Google, Discord, Credentials)
- **Styling**: Tailwind CSS with shadcn/ui components
- **Type Checking**: TypeScript
- **Testing**: Jest for unit tests, Playwright for E2E tests
- **Linting**: oxlint

## Essential Development Commands

```bash
# Development server
bun run dev

# Database operations
bun run db:push          # Push schema changes to database
bun run db:generate      # Generate Prisma client
bun run db:studio        # Open Prisma Studio

# Testing
bun run test             # Run Jest unit tests
bun run test:watch       # Run Jest in watch mode
bun run test:e2e         # Run Playwright E2E tests
bun run test:e2e:ui      # Run E2E tests with UI

# Linting & Type Checking
bun run lint             # Run oxlint
bun run typecheck        # TypeScript type checking

# Building
bun run build           # Build for production
bun run start           # Start production server
```

npxではなくbunxを使用。
shadcnでGitHub風のUI.

## Architecture Overview

### App Router Structure
- `/src/app/` - Next.js App Router pages and layouts
- `/src/app/_components/` - Shared UI components
- `/src/app/api/` - API routes (auth, profile, skills)
- `/src/components/` - shadcn/ui components and profile components

### Server Architecture
- `/src/server/` - Server-side code
  - `/auth/` - NextAuth.js configuration and providers
  - `/api/` - tRPC API routes and routers
  - `/db.ts` - Prisma database client

### Authentication Flow
- Multiple providers: Email/password, GitHub, Google, Discord
- Session management via NextAuth.js with JWT strategy
- Custom credentials provider with bcrypt password hashing
- User registration API at `/api/auth/register`

### Database Models
Key models in Prisma schema:
- `User` - Extended with profile fields (bio, grade, contact, githubUrl)
- `Skill` - Skills catalog with categories
- `UserSkill` - Junction table for user skills with levels (1-5) and experience years
- `Account`, `Session`, `VerificationToken` - NextAuth.js models

## Environment Configuration

Environment variables are managed through `@t3-oss/env-nextjs` in `/src/env.js`:
- Database: `DATABASE_URL`
- Auth: `AUTH_SECRET`, `AUTH_URL`
- OAuth providers: `AUTH_GITHUB_ID/SECRET`, `AUTH_GOOGLE_ID/SECRET`, `AUTH_DISCORD_ID/SECRET`

When adding new env vars:
1. Update `/src/env.js` schema
2. Update `.env.example`
3. Add to runtime environment object

## Testing Configuration

### Jest (Unit Tests)
- Config: `jest.config.cjs`
- Location: `/src/tests/`
- Path mapping: `~/` -> `/src/`

### Playwright (E2E Tests)
- Config: `playwright.config.ts`
- Location: `/e2e/`
- Global auth setup at `/e2e/auth.setup.ts`
- Authenticated tests use `chromium-auth` project
- Base URL: `http://localhost:3000`

## Key Development Patterns

### Component Structure
- Use shadcn/ui components from `/src/components/ui/`
- Follow existing Tailwind CSS patterns
- Profile components in `/src/components/profile/`

### API Patterns
- tRPC for type-safe APIs in `/src/server/api/`
- REST endpoints for authentication in `/src/app/api/`
- Zod schemas for validation
- Session-based authorization

### Form Validation
- Client-side validation with Zod
- Server-side validation in API routes
- Error handling with try/catch and proper HTTP status codes

### Database Operations
- Use Prisma client from `/src/server/db`
- Follow existing transaction patterns
- Cascade deletes configured in schema

## Important Notes

- This project uses `bun` as the package manager - never use `npm` or `yarn`
- Always run database migrations with `bun run db:push` after schema changes
- Profile and skill management features are fully implemented with comprehensive tests
- E2E tests require authentication setup and use storage state for logged-in scenarios
- Linting uses oxlint instead of ESLint
- The project has detailed documentation in `AUTHENTICATION.md` and `PROFILE_FEATURE.md`