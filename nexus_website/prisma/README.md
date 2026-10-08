# Database Setup (PostgreSQL + Prisma)

NEXUS uses **PostgreSQL** via **Prisma ORM** for all persistent data. This replaces the legacy JSON file storage.

## Quick Start (Local Development)

### 1. Get a free Postgres database

Choose one (all have free tiers):

- **Neon** (recommended) → https://neon.tech — 0.5 GB free
- **Supabase** → https://supabase.com — 500 MB + auth/storage
- **Railway** → https://railway.app — $5/mo credit

### 2. Set the connection string

In `.env.local`:

```bash
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require
```

### 3. Push schema + seed data

```bash
npm run db:push    # Create tables from prisma/schema.prisma
npm run db:seed    # Import data from data/*.json
```

### 4. Verify

Visit `/api/admin/db-status` while logged in as admin to see row counts.

## Available Scripts

| Command | Description |
|---|---|
| `npm run db:generate` | Regenerate Prisma client (after schema changes) |
| `npm run db:push` | Sync schema → database (no migration files) |
| `npm run db:migrate` | Create versioned migration (for production) |
| `npm run db:seed` | Import all `data/*.json` into Postgres |
| `npm run db:studio` | Open Prisma Studio (visual DB editor) |

## Schema

All entities are in `prisma/schema.prisma`:

- **Admin** — AdminUser, AdminSession, ActivityLog
- **Academy** — Program, Cohort, Registration
- **Content** — Faq, BlogPost, JourneyEntry, Opportunity
- **Services** — ServiceOrder, Milestone
- **AI** — AiVideo, AiConversation
- **Inquiries** — ContactMessage, PartnerInquiry, NewsletterSubscriber, PendingApplication
- **Live** — LiveChat
- **System** — MediaItem, NotificationLog, SiteSettings

## Migration Path from JSON

The legacy `data/*.json` files are still present. The seed script reads them and upserts into Postgres. To migrate:

1. `npm run db:push` — creates tables
2. `npm run db:seed` — imports JSON
3. Verify counts in `/api/admin/db-status`
4. Once verified, you can:
   - Delete the JSON files (recommended for production)
   - Keep them as backup / import source for other environments

## Production Deployment

For production, use `prisma migrate` instead of `db push`:

```bash
DATABASE_URL=your_prod_url npx prisma migrate deploy
```

This applies versioned migration files in `prisma/migrations/`.

## Future Migrations

When you change `schema.prisma`:

```bash
npm run db:migrate -- --name describe_your_change
```

This creates a new migration file under `prisma/migrations/` that you commit to git. Apply it in production with `prisma migrate deploy`.
