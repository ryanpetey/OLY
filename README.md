# OLY MVP

A mobile-friendly web app for private, asynchronous friendship-building.

## Stack
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Prisma
- SQLite (local development)
- NextAuth credentials-based MVP auth

## Features in this MVP
- Create private groups
- Share invite links
- Join via invite token
- One active prompt round per group
- One response per member per round
- Responses hidden until everyone responds or round closes
- Reveal page with thoughtful response layout
- Dashboard with who answered vs waiting
- 50 seeded prompts with category + intimacy level

## Project structure

```text
src/
  app/
    actions.ts
    api/auth/[...nextauth]/route.ts
    groups/
    join/[token]/
    signin/
  components/
  lib/
prisma/
  schema.prisma
  seed.ts
```

## Local setup

1. Install dependencies
   ```bash
   npm install
   ```
2. Copy environment file
   ```bash
   cp .env.example .env
   ```
3. Generate Prisma client
   ```bash
   npm run prisma:generate
   ```
4. Create database and apply migrations
   ```bash
   npx prisma migrate dev --name init
   ```
5. Seed prompts
   ```bash
   npm run prisma:seed
   ```
6. Start app
   ```bash
   npm run dev
   ```
7. Open http://localhost:3000

## Notes
- Auth is intentionally lightweight for MVP; users sign in with name + email.
- To move to Postgres later, change `datasource db` provider/url and run Prisma migrations.
