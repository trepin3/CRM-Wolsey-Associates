# Wolsey & Associates — Insurance CRM

Monorepo scaffold for the Insurance CRM mobile app (Expo) and backend (Node + Express + Prisma).

Quick start (local dev requires Docker for Postgres):

1. Copy `.env.example` to `.env` in the `packages/server` folder and populate values.
2. Start Postgres via Docker Compose:

```bash
docker-compose up -d
```

3. From repo root, install dependencies:

```bash
yarn install
```

4. Start server and mobile app concurrently:

```bash
yarn dev
```

Server: `http://localhost:4000/health`  
Expo: Metro dev server will open.

Next steps:
- Implement auth, Prisma migrations, and mobile screens.
