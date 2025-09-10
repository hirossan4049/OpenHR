# GitHub Copilot Instructions

This is a T3 Stack project. Please follow the existing conventions and patterns in the codebase.

## Key Technologies

- **Package Manager:** This project uses `bun` instead of `npm` or `yarn`. Please use `bun` for all package management commands (e.g., `bun install`, `bun add`). Scripts should be run with `bun run ...`.
- **Framework:** Next.js with App Router.
- **Authentication:** NextAuth.js
- **ORM:** Prisma
- **Database:** SQLite
- **Styling:** Tailwind CSS
- **Language:** TypeScript
- npxではなくbunxを使用。

## Development

To start the development server, run:
```bash
bun run dev
```

To push database changes, run:
```bash
bun run db:push
```

When adding new environment variables, remember to update `/src/env.js` and `.env.example`.
