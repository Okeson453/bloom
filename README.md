# Bloom Finance

A fintech investment platform with a Next.js frontend and Node.js serverless backend on Vercel + Supabase.

## 🏗️ Architecture

```
bloom/
├── frontend/                 # Static Next.js/React frontend
│   ├── index.html
│   ├── css/
│   └── js/
├── backend/                  # Vercel serverless API
│   ├── api/                  # Dynamic API routes
│   │   ├── portfolios/       # Portfolio management
│   │   ├── transactions/     # Deposits & withdrawals
│   │   ├── markets/          # Market data & quotes
│   │   ├── holdings/         # Holdings analysis
│   │   ├── goals/            # Investment goals
│   │   ├── learn/            # Educational content
│   │   ├── notifications/    # Email & alerts
│   │   └── onboarding/       # User onboarding
│   ├── _lib/                 # Shared utilities
│   │   ├── supabaseUser.js   # Authenticated client
│   │   ├── supabase.js       # Admin client
│   │   ├── response.js       # Response handlers
│   │   └── validate.js       # Request validation
│   ├── supabase/             # Database migrations
│   ├── tests/                # Test suites
│   ├── scripts/              # Seed & setup scripts
│   └── vercel.json           # Vercel config (backend)
├── vercel.json               # Root Vercel config
├── package.json
└── backend/package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm 10+
- Supabase project ([create one](https://supabase.com))

### Local Development

```bash
# Install dependencies
cd backend
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials and API keys

# Start Supabase locally (optional)
supabase start

# Run backend locally
npm run dev

# In another terminal, serve frontend
cd ../frontend
npx http-server -p 3000
```

### Environment Variables

Create `/backend/.env.local`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
MARKET_DATA_API_KEY=your-polygon-io-key
MARKET_DATA_BASE_URL=https://api.polygon.io
PRICE_CACHE_TTL_SECONDS=3600
RESEND_API_KEY=your-resend-key
EMAIL_FROM=noreply@bloom.finance
ENVIRONMENT=development
```

## 📦 Deployment

### Deploy to Vercel

1. **Connect repository**
   ```bash
   vercel link
   ```

2. **Add environment variables** in Vercel Dashboard:
   - Settings → Environment Variables
   - Add all variables from `.env.local`

3. **Deploy**
   ```bash
   vercel deploy --prod
   ```

Or push to GitHub and let Vercel auto-deploy.

## 🔧 Recent Fixes (v2.0.0)

### Critical Issues Resolved

#### ✅ Missing `_lib/` Utilities
- Created `/backend/_lib/` with essential shared utilities
- **supabaseUser.js**: Authenticated Supabase client from request headers
- **response.js**: Standardized HTTP response handlers
- **supabase.js**: Admin Supabase client for server operations
- **validate.js**: Request validation schemas

#### ✅ Risk Level Enum Mismatch
- Fixed portfolio creation validation
- Maps frontend terms to database enums:
  - `conservative` → `low`
  - `moderate` → `medium`
  - `aggressive` → `high`

#### ✅ Missing Auth Checks
- Added authentication validation to `/api/markets/quotes`
- Prevents unauthorized market data access

#### ✅ Balance Tracking
- Deposit transactions now update `user_wallets.available_balance`
- Withdrawal transactions update balance and validate sufficiency
- Portfolio transactions update `portfolios.total_invested`

#### ✅ Atomic Rebalance Operation
- Validates all assets before making changes
- Stores current assets for rollback on failure
- Validates total asset weight = 100%
- Prevents data loss from partial failures

## 📚 API Endpoints

### Portfolios
- `GET /api/portfolios` - List user's portfolios
- `POST /api/portfolios/create` - Create new portfolio
- `GET /api/portfolios/[id]` - Get portfolio details
- `POST /api/portfolios/invest` - Add investment to portfolio
- `PUT /api/portfolios/rebalance` - Rebalance portfolio assets

### Transactions
- `GET /api/transactions` - List transactions
- `POST /api/transactions/deposit` - Create deposit
- `POST /api/transactions/withdraw` - Create withdrawal

### Markets
- `GET /api/markets/quotes` - Get asset quotes
- `GET /api/markets/search` - Search assets
- `GET /api/markets/indices` - Get market indices

### Holdings
- `GET /api/holdings/performance` - Get holdings performance

### Goals
- `GET /api/goals` - List investment goals
- `POST /api/goals/create` - Create new goal
- `GET /api/goals/[id]` - Get goal details

### Learning
- `GET /api/learn/articles` - List articles
- `GET /api/learn/articles/[id]` - Get article

### Onboarding
- `POST /api/onboarding/quiz` - Submit onboarding quiz
- `POST /api/onboarding/complete` - Mark onboarding complete

## 🧪 Testing

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# Watch mode
npm run test:watch

# Coverage
npm run test:unit -- --coverage
```

## 📋 Database Schema

See `/backend/supabase/migrations/` for complete schema:

### Key Tables
- `users` - User accounts
- `user_wallets` - User balances and funds
- `portfolios` - Investment portfolios
- `portfolio_assets` - Assets in each portfolio
- `transactions` - Deposits, withdrawals, investments
- `holdings` - Current stock holdings
- `goals` - Investment goals
- `articles` - Educational content
- `price_cache` - Cached market prices

## 🔐 Authentication

Uses Supabase Auth with JWT tokens:

1. User signs up/logs in via frontend
2. Supabase returns JWT access token
3. Frontend sends token in `Authorization: Bearer <token>` header
4. Backend validates token with Supabase

## 📊 Performance

- **Memory limit**: 3008 MB per function
- **Timeout**: 60 seconds per request
- **Region**: US East (iad1)
- **Cache TTL**: 1 hour for price data (configurable)

## 🤝 Development

### Code Style
- ESLint configured for all backend code
- Use `npm run lint` to check
- Use `npm run lint:fix` to auto-fix

### Adding New Endpoints

1. Create file in `/backend/api/[resource]/endpoint.js`
2. Import utilities from `_lib/`
3. Authenticate with `supabaseUser(req)`
4. Return responses with `sendOk()`, `sendBadRequest()`, etc.

Example:
```javascript
import supabaseUser from '../../_lib/supabaseUser.js'
import { sendOk, sendUnauthorized, sendBadRequest } from '../../_lib/response.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const supabase = supabaseUser(req)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return sendUnauthorized(res, 'User not authenticated')
    }

    // Your logic here...
    return sendOk(res, { data: 'success' })
  } catch (error) {
    console.error('Handler error:', error)
    return sendInternalError(res, error.message)
  }
}
```

## 🐛 Troubleshooting

### 404 on API calls
- Verify `Authorization` header is set correctly
- Check Supabase credentials in environment variables
- Ensure API route exists at correct path

### "User not authenticated"
- Verify JWT token hasn't expired
- Check token format: `Bearer eyJ...`
- Ensure Supabase keys are correct

### Database errors
- Run migrations: `npm run db:push`
- Check Supabase logs for constraint violations
- Verify user_id matches in queries

## 📄 License

UNLICENSED (Proprietary)

## 👥 Authors

Bloom Finance Engineering

---

**Last Updated**: May 18, 2026  
**Current Version**: 2.0.0
