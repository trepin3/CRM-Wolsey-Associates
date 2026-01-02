# Wolsey Server

Run locally:

1. Copy `.env.example` to `.env` and set `DATABASE_URL`.
2. Start Postgres (see repo `docker-compose.yml`).
3. Install deps from repo root: `yarn install`.
4. Generate Prisma client and run migrations:

```bash
cd packages/server
yarn prisma:generate
yarn prisma:migrate
node ./prisma/seed.ts
```

5. Start dev server:

```bash
yarn dev
```

Health: `http://localhost:4000/health`
