# 🚀 Bloom Finance Deployment Flow — Visual Guide

## High-Level Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Your Local Machine                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  VS Code / Git                                       │   │
│  │  backend/  frontend/  vercel.json  package.json      │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────┬─────────────────────────────────────────────┘
                 │
                 │ git push origin main
                 ↓
┌──────────────────────────────────────────────────────────────┐
│               GitHub Repository (Main Branch)                │
│  (Triggers automatic deployment on Vercel)                   │
└────────────────┬─────────────────────────────────────────────┘
                 │
                 │ Webhook notification
                 ↓
┌──────────────────────────────────────────────────────────────┐
│                    Vercel Build Process                       │
│  ┌────────────────────────────────────────────────────┐      │
│  │ 1. Install dependencies: npm install (backend)    │      │
│  │ 2. Build output: frontend/ folder                 │      │
│  │ 3. Configure rewrites: vercel.json                │      │
│  │ 4. Inject environment variables                   │      │
│  │ 5. Deploy serverless functions                    │      │
│  └────────────────────────────────────────────────────┘      │
└────┬────────────────────────────────────────────────────┬────┘
     │                                                    │
     ↓ Frontend (Static)                                 ↓ Backend (Serverless)
┌──────────────────────┐                    ┌──────────────────────┐
│  Vercel Edge Network │                    │  Vercel Functions    │
│  (Global CDN)        │                    │  (Node.js 24.x)      │
│  - index.html        │                    │  - api/health        │
│  - css/              │  ◄─── rewrites ───►  - api/markets/      │
│  - js/               │                    │  - api/auth/         │
│  - static files      │                    │  - api/portfolios/   │
│  (Cached globally)   │                    │  - api/transactions/ │
└──────────────────────┘                    └──────────────────────┘
         │                                           │
         │ HTTPS 🔒                                 │ HTTPS 🔒
         │                                           │
         └────────────────┬─────────────────────────┘
                          │
                          ↓
                    ┌──────────────┐
                    │   Browser    │
                    │  User Access │
                    └──────────────┘
                          ▲
                          │ API calls
                          │
                          ↓
                  ┌─────────────────┐
                  │   Supabase      │
                  │   (PostgreSQL)  │
                  │   + Auth        │
                  │   + Real-time   │
                  └─────────────────┘
```

---

## Deployment Phases Timeline

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  WEEK 1: FOUNDATION                                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Day 1-2: Setup (30 min)                                                   │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ Step 1: Set Environment Variables in Vercel (15 min)               │   │
│  │ ✓ SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY     │   │
│  │ ✓ MARKET_DATA_API_KEY, RESEND_API_KEY                            │   │
│  │ ✓ ENVIRONMENT=production                                          │   │
│  │ → Result: App accessible at https://bloom.vercel.app             │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  Day 2-3: Database & Testing (20 min)                                       │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ Step 2: Seed Database (5 min)                                       │   │
│  │ $ npm run seed  (from backend/)                                     │   │
│  │ → Result: Articles & portfolios in Supabase                       │   │
│  │                                                                     │   │
│  │ Step 3: Test Critical Endpoints (15 min)                          │   │
│  │ ✓ GET /api/health → 200 OK                                       │   │
│  │ ✓ GET /api/markets/quotes → Real data                            │   │
│  │ ✓ GET /api/learn/articles → Article list                         │   │
│  │ → Result: API working, no 500 errors                             │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ✅ END OF WEEK 1: App is LIVE ✓ (https://bloom.vercel.app)              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  WEEK 2: POLISH                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Day 1-2: Domain Setup (25 min + 24-48h wait)                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ Step 4: Buy Custom Domain (5 min)                                   │   │
│  │ - Go to Namecheap, GoDaddy, or Google Domains                       │   │
│  │ - Search: bloomfinance.com (~$12-15/year)                          │   │
│  │ - Purchase & activate                                              │   │
│  │ → Result: Domain active, nameservers editable                      │   │
│  │                                                                     │   │
│  │ Step 5: Connect to Vercel (10 min)                                │   │
│  │ - Vercel Dashboard → Settings → Domains                           │   │
│  │ - Add Domain: bloomfinance.com                                    │   │
│  │ - Copy Vercel's nameservers                                       │   │
│  │ - Go to registrar, update nameservers                             │   │
│  │ → Result: DNS configured (propagation: 24-48h)                   │   │
│  │                                                                     │   │
│  │ Step 6: Verify & Update Config (10 min)                          │   │
│  │ - Update EMAIL_FROM in Vercel env vars                            │   │
│  │ - Re-deploy when DNS propagates                                   │   │
│  │ - Verify: https://bloomfinance.com loads app                      │   │
│  │ → Result: Custom domain LIVE ✓                                    │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  Day 3+: Monitoring Setup (10 min)                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ Step 7: Enable Analytics (10 min)                                  │   │
│  │ - Vercel Dashboard → Analytics                                     │   │
│  │ - Enable Web Analytics ✓                                           │   │
│  │ - Enable Speed Insights ✓                                          │   │
│  │ - Bookmark Vercel Logs page                                        │   │
│  │ → Result: Real-time monitoring active                             │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ✅ END OF WEEK 2: Production Professional ✓                              │
│     (Custom Domain + Monitoring)                                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  WEEK 3+: OPTIMIZATION (If Needed)                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Ongoing: Monitor & Optimize                                                │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ Step 8: Performance Monitoring (Daily)                             │   │
│  │ - Check Vercel Logs for slow endpoints (>2s)                       │   │
│  │ - Review analytics for errors or bottlenecks                       │   │
│  │ - Monitor database query times                                     │   │
│  │                                                                     │   │
│  │ Step 9: Optimize (If Needed)                                       │   │
│  │ If any endpoint >2s:                                               │   │
│  │ - Add database indexes (10 min)                                    │   │
│  │ - Implement caching (20 min)                                       │   │
│  │ - Batch API calls (15 min)                                         │   │
│  │ - Re-test (5 min)                                                  │   │
│  │ → Result: All endpoints <500ms ✓                                  │   │
│  │                                                                     │   │
│  │ Step 10: Advanced (If Still Needed)                              │   │
│  │ - Set up Redis caching (20 min)                                    │   │
│  │ - Configure cron jobs (30 min)                                     │   │
│  │ - Enable rate limiting (15 min)                                    │   │
│  │ → Result: Highly optimized, scalable ✓                           │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ✅ ONGOING: Production Ready & Optimized ✓                               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Request Flow Diagram

```
┌─────────────────────┐
│   User Browser      │
│  (Frontend)         │
└──────────┬──────────┘
           │
           │ HTTPS Request
           │ GET /api/markets/quotes
           ↓
┌──────────────────────────────────────────┐
│   Vercel Edge Network (Global CDN)       │
│  - Route request to correct region       │
│  - Apply rewrites: /api/* → /backend/api │
│  - Cache if needed                       │
└──────────┬───────────────────────────────┘
           │
           │ Forward to function
           ↓
┌──────────────────────────────────────────┐
│   Vercel Function (iad1 region)          │
│  backend/api/markets/quotes.js           │
│  - Load environment variables            │
│  - Check cache (Redis/Supabase)         │
│  - Call Polygon.io API if needed        │
│  - Return data                           │
└──────────┬───────────────────────────────┘
           │
           │ Optional: Call External APIs
           ├──→ Polygon.io (market data)
           ├──→ Supabase (auth validation)
           └──→ Redis (cache)
           │
           │ Return response
           ↓
┌──────────────────────────────────────────┐
│   Vercel Response Handler                │
│  - Set cache headers                     │
│  - Set CORS headers                      │
│  - Compress response                     │
│  - Send to browser                       │
└──────────┬───────────────────────────────┘
           │
           │ HTTPS Response
           │ {quotes: [...]}
           ↓
┌──────────────────────────────────────────┐
│   User Browser                           │
│  - Parse response                        │
│  - Render UI                             │
│  - Cache locally (browser cache)         │
└──────────────────────────────────────────┘
```

---

## Error Handling Flow

```
┌─────────────────────────────────────┐
│   Request to Endpoint               │
└────────────┬────────────────────────┘
             │
             ├─ Is env var missing?
             │  ├─ Yes → 500 Error (check Vercel env vars)
             │  └─ No → Continue
             │
             ├─ Is database down?
             │  ├─ Yes → 503 Error (wait, check Supabase status)
             │  └─ No → Continue
             │
             ├─ Is authentication invalid?
             │  ├─ Yes → 401 Error (get new auth token)
             │  └─ No → Continue
             │
             ├─ Is query slow (>2s)?
             │  ├─ Yes → Consider caching / indexes
             │  └─ No → Continue
             │
             ├─ Does function timeout (>60s)?
             │  ├─ Yes → Break into smaller tasks
             │  └─ No → Continue
             │
             └─ ✓ Success → 200 OK Response
```

---

## Deployment Statistics

```
┌─────────────────────────────────────────────────────────────┐
│                 Performance Targets                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Response Times:                                             │
│  ├─ Healthy:    P50 <200ms, P95 <500ms                      │
│  ├─ Warning:    P50 200-500ms, P95 500-1000ms               │
│  └─ Critical:   P50 >500ms, P95 >1000ms                     │
│                                                              │
│  Error Rates:                                                │
│  ├─ Healthy:    <0.1% of requests                           │
│  ├─ Warning:    0.1-1% of requests                          │
│  └─ Critical:   >1% of requests                             │
│                                                              │
│  Availability:                                               │
│  ├─ Target:     99.9% uptime                                │
│  ├─ Warning:    95-99.9% uptime                             │
│  └─ Critical:   <95% uptime                                 │
│                                                              │
│  Function Duration:                                          │
│  ├─ Healthy:    <500ms for most endpoints                   │
│  ├─ Warning:    500ms-2s                                    │
│  └─ Critical:   >2s or timeouts                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Monitoring Dashboard

```
Vercel Analytics Dashboard
┌───────────────────────────────────────────────────────────────┐
│  Overview                                              Today   │
├───────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Page Views: 1,234          ↗ 12% from yesterday      │   │
│  │ Unique Visitors: 456       ↗ 8% from yesterday       │   │
│  │ Bounce Rate: 32%           ↘ 2% from yesterday       │   │
│  │ Avg Session: 3m 45s        ↗ 5% from yesterday       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Core Web Vitals                                         │   │
│  │ ├─ LCP (Largest Contentful Paint): 1.2s    ✓ Good    │   │
│  │ ├─ FID (First Input Delay): 45ms           ✓ Good    │   │
│  │ ├─ CLS (Cumulative Layout Shift): 0.05     ✓ Good    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ API Performance                                         │   │
│  │ ├─ /api/health: 12ms avg                  ✓           │   │
│  │ ├─ /api/markets/quotes: 234ms avg         ⚠ Warning  │   │
│  │ ├─ /api/portfolios: 156ms avg             ✓           │   │
│  │ ├─ /api/auth/login: 892ms avg             ⚠ Check    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└───────────────────────────────────────────────────────────────┘
```

---

## Deployment Success Checklist Visual

```
✅ LIVE                              ✅ PROFESSIONAL
┌──────────────────┐              ┌──────────────────┐
│ Week 1 Complete  │              │ Week 2 Complete  │
├──────────────────┤              ├──────────────────┤
│ ✓ Env vars set   │              │ ✓ Custom domain  │
│ ✓ Database seeded│              │ ✓ DNS configured │
│ ✓ APIs working   │              │ ✓ Monitoring on  │
│ ✓ No 500 errors  │              │ ✓ Analytics on   │
│ ✓ Tests pass     │              │ ✓ SSL/TLS active │
│                  │              │                  │
│ Users can access │              │ Professional     │
│ your app now! 🚀 │              │ ready! 🎯        │
└──────────────────┘              └──────────────────┘

                ✅ OPTIMIZED
              ┌──────────────────┐
              │ Week 3+ Complete │
              ├──────────────────┤
              │ ✓ All <500ms avg │
              │ ✓ Cache enabled  │
              │ ✓ Scaling ready  │
              │ ✓ Rate limited   │
              │ ✓ Secure & RLS   │
              │                  │
              │ Production grade │
              │ ready! ⚡        │
              └──────────────────┘
```

---

## Cost Breakdown

```
┌─────────────────────────────────────────────────────────┐
│  Monthly Operating Costs                                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Vercel Hosting:                                        │
│  ├─ Hobby Plan (Free tier):          $0/month          │
│  │  - 5,000 edge requests            ✓ Included        │
│  │  - 100GB bandwidth                 ✓ Included        │
│  │  - Unlimited deployments           ✓ Included        │
│  │  - (For 1000s of users, upgrade to Pro)             │
│  │                                                      │
│  ├─ Pro Plan (if needed):             $20/month        │
│  │  - Unlimited edge requests         ✓ Included        │
│  │  - Unlimited bandwidth             ✓ Included        │
│  │  - Advanced monitoring             ✓ Included        │
│  │                                                      │
│  Supabase:                                              │
│  ├─ Free tier:                        $0/month          │
│  │  - 500MB storage                   ✓ Included        │
│  │  - 1GB bandwidth/month             ✓ Included        │
│  │  - 50MB file uploads               ✓ Included        │
│  │                                                      │
│  ├─ Pro tier (if needed):             $25/month        │
│  │  - Larger databases                ✓ +$0.135/GB     │
│  │  - More bandwidth                  ✓ +$0.04/GB      │
│  │                                                      │
│  Polygon.io (Market Data):                              │
│  ├─ Starter (Free):                   $0/month          │
│  │  - 5 API calls/minute              ✓ Included        │
│  │  - Basic market data               ✓ Included        │
│  │                                                      │
│  ├─ Professional (if needed):         $199/month       │
│  │  - Unlimited API calls             ✓ Included        │
│  │  - Advanced data feeds             ✓ Included        │
│  │                                                      │
│  Resend (Email):                                        │
│  ├─ Free:                             $0/month          │
│  │  - 100 emails/day                  ✓ Included        │
│  │                                                      │
│  ├─ Paid (if needed):                 $10+/month       │
│  │  - Unlimited emails                ✓ Based on volume │
│  │                                                      │
│  Custom Domain:                                         │
│  ├─ Annual registration:              $12-15/year       │
│  │  (paid at registrar)                                │
│  │                                                      │
│  ─────────────────────────────────────────────────────  │
│  TOTAL (Free tier):                   ~$1-2/month      │
│  TOTAL (Professional):                ~$250-300/month  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Quick Reference: File Locations

```
Your Repo Structure
├── frontend/                      (Static, served by Vercel CDN)
│   ├── index.html
│   ├── css/
│   │   └── styles.css
│   └── js/
│       └── app.js
│
├── backend/                       (Serverless functions)
│   ├── api/
│   │   ├── health.js             (GET /api/health)
│   │   ├── auth/signup.js        (POST /api/auth/signup)
│   │   ├── markets/quotes.js     (GET /api/markets/quotes)
│   │   ├── portfolios/
│   │   │   ├── index.js          (GET /api/portfolios)
│   │   │   ├── create.js         (POST /api/portfolios/create)
│   │   │   └── [id].js           (GET /api/portfolios/[id])
│   │   ├── transactions/
│   │   ├── learn/articles.js
│   │   └── ...
│   ├── _lib/                      (Shared utilities)
│   │   ├── supabase.js
│   │   ├── supabaseUser.js
│   │   ├── response.js
│   │   └── validate.js
│   ├── supabase/                  (Database migrations)
│   ├── scripts/
│   │   ├── seed-articles.js
│   │   └── seed-portfolios.js
│   ├── package.json
│   ├── vercel.json                (Backend config)
│   └── .env.example
│
├── vercel.json                    (Root config - rewrites, regions)
├── package.json                   (Root dependencies)
└── README.md

Environment File
├── .env.local                     (Local development)
│   ├── SUPABASE_URL
│   ├── SUPABASE_ANON_KEY
│   ├── MARKET_DATA_API_KEY
│   ├── RESEND_API_KEY
│   └── ...
│
└── Vercel Dashboard (Production)  (Set in Vercel UI, not committed)
    ├── Production env vars
    └── Preview env vars
```

---


