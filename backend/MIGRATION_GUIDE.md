# Bloom Finance Backend — Migration to Supabase + Vercel

## Overview

This migration moves Bloom Finance from AWS (Lambda + DynamoDB + Cognito + SAM) to **Supabase** (Postgres + Auth) + **Vercel** (Serverless Functions).

## What Changed

### Infrastructure
- **AWS Lambda** → **Vercel Serverless Functions** (Node.js 20)
- **DynamoDB** → **Supabase Postgres** with Row Level Security (RLS)
- **AWS Cognito** → **Supabase Auth**
- **AWS SES** → **Resend** (email)
- **AWS EventBridge** → **pg_cron** + Supabase Edge Functions (Deno)

### Project Structure

```
bloom/backend/
├── api/                                    # NEW: Vercel Serverless Functions
│   ├── _lib/                              # Shared utilities
│   │   ├── supabase.js                    # Admin client
│   │   ├── supabaseUser.js                # Per-request user client
│   │   ├── response.js                    # HTTP response helpers
│   │   ├── validate.js                    # Validation schemas (Joi)
│   │   └── errors.js                      # Custom error classes
│   ├── users/                             # User management endpoints
│   │   ├── me.js                          # GET /api/users/me
│   │   ├── update.js                      # PUT /api/users/update
│   │   └── delete.js                      # DELETE /api/users/delete
│   ├── portfolios/                        # Portfolio management
│   │   ├── index.js                       # GET /api/portfolios
│   │   ├── [id].js                        # GET /api/portfolios/[id]
│   │   └── create.js                      # POST /api/portfolios/create
│   ├── holdings/                          # Holdings tracking
│   ├── transactions/                      # Transaction management
│   ├── goals/                             # Financial goals
│   ├── markets/                           # Market data & quotes
│   ├── learn/                             # Educational content
│   ├── notifications/                     # Email notifications
│   └── onboarding/                        # User onboarding
├── supabase/                              # NEW: Supabase configuration
│   ├── config.toml                        # Local dev config
│   ├── migrations/                        # Database schema
│   │   ├── 001_users.sql                  # profiles + onboarding
│   │   ├── 002_portfolios.sql             # portfolios + assets
│   │   ├── 003_holdings.sql               # holdings + snapshots
│   │   ├── 004_transactions.sql           # transactions
│   │   ├── 005_goals.sql                  # financial goals
│   │   ├── 006_learn.sql                  # articles + progress
│   │   ├── 007_markets.sql                # price_cache
│   │   └── 008_utilities.sql              # helper functions
│   ├── seed/                              # Sample data
│   │   ├── portfolios.sql                 # Sample portfolios
│   │   └── articles.sql                   # Sample articles
│   └── functions/                         # Edge Functions (Deno)
│       ├── on-user-created/               # User signup webhook
│       ├── price-refresh/                 # Scheduled: every 60s
│       ├── portfolio-snapshot/            # Scheduled: daily 00:00 UTC
│       └── monthly-summary/               # Scheduled: 1st of month 08:00 UTC
├── vercel.json                            # NEW: Vercel configuration
├── package.json                           # UPDATED: Dependencies
├── .env.example                           # UPDATED: Environment variables
├── functions/                             # OLD: AWS Lambda (marked for deletion)
├── infrastructure/                        # OLD: AWS SAM (marked for deletion)
├── layers/                                # OLD: Lambda Layers (marked for deletion)
└── scripts/                               # Partially migrated
```

## Environment Variables

Replace your `.env.local` with:

```bash
ENVIRONMENT=local

# Supabase
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Market Data
MARKET_DATA_API_KEY=your_api_key_here
MARKET_DATA_BASE_URL=https://api.polygon.io/v2
PRICE_CACHE_TTL_SECONDS=60

# Email
RESEND_API_KEY=re_...
EMAIL_FROM=hello@bloomfinance.com
```

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Supabase Locally
```bash
npm run supabase:start
```

### 3. Apply Migrations
```bash
npm run db:push
```

### 4. Seed Data
```bash
npm run seed
```

### 5. Start Development Server
```bash
npm run dev
```

The API will be available at `http://localhost:3000/api/`.

## API Endpoints

### Users
- `GET /api/users/me` — Get current user profile
- `PUT /api/users/update` — Update profile
- `DELETE /api/users/delete` — Delete account

### Portfolios
- `GET /api/portfolios` — List all portfolios (paginated)
- `GET /api/portfolios/[id]` — Get specific portfolio
- `POST /api/portfolios/create` — Create new portfolio

### Transactions
- `GET /api/transactions` — List transactions (paginated)

### Goals
- `GET /api/goals` — List financial goals (paginated)
- `POST /api/goals/create` — Create new goal

### Markets
- `GET /api/markets/quotes?symbols=VTI,BND` — Get price quotes

### Learn
- `GET /api/learn/articles` — List articles (paginated)

## Database Schema

All tables have **Row Level Security (RLS)** policies:

- **profiles** — User profile data
- **onboarding** — Onboarding progress
- **portfolios** — User portfolios
- **portfolio_assets** — Individual holdings in portfolios
- **holdings** — Aggregate holdings
- **snapshots** — Historical portfolio snapshots
- **transactions** — All financial transactions
- **goals** — User financial goals
- **articles** — Educational content
- **learn_progress** — User learning progress
- **price_cache** — Market price cache (1-minute TTL)

## Scheduled Jobs

These are triggered via `pg_cron` and run as Supabase Edge Functions:

| Schedule | Job | Trigger |
|----------|-----|---------|
| Every 60s | `price-refresh` | Updates market price cache |
| Daily 00:00 UTC | `portfolio-snapshot` | Creates daily portfolio snapshots |
| 1st of month 08:00 UTC | `monthly-summary` | Sends monthly email summaries |

## Testing

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# Watch mode
npm run test:watch
```

## Deployment

### Staging
```bash
npm run deploy:staging
```

### Production
```bash
npm run deploy:prod
```

## Removing AWS-Specific Code

The following directories contain old AWS code and can be deleted after migration is complete:

```
infrastructure/          # AWS SAM templates
functions/              # Old Lambda handlers (replaced by api/)
layers/                 # Lambda Layers (replaced by api/_lib/)
scripts/local-dev.sh    # Old local dev setup
```

To clean up:
```bash
rm -rf infrastructure/ functions/ layers/ scripts/local-dev.sh
```

## Key Differences from AWS

### Authentication
- **Before:** Extract user ID from `event.requestContext.authorizer.claims.sub`
- **After:** Use `supabase.auth.getUser()` → `user.id`

### Database Queries
- **Before:** DynamoDB single-table with `PK#SK` patterns
- **After:** Postgres SQL with relational joins

### Transaction Handling
- **Before:** `transactWrite` API calls
- **After:** Postgres transactions (atomic by default)

### Scheduled Tasks
- **Before:** AWS EventBridge → Lambda
- **After:** `pg_cron` → Supabase Edge Functions (Deno, not Node.js)

### Email
- **Before:** AWS SES SDK
- **After:** Resend SDK

## Error Handling

Custom error classes in `api/_lib/errors.js`:

- `AuthError` (401) — Authentication failed
- `NotFoundError` (404) — Resource not found
- `ValidationError` (400) — Input validation failed
- `ConflictError` (409) — Resource already exists
- `ForbiddenError` (403) — Permission denied
- `RateLimitError` (429) — Rate limit exceeded

## Support

For issues or questions about this migration, refer to:

- [Supabase Docs](https://supabase.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Deno Docs](https://deno.land/manual)