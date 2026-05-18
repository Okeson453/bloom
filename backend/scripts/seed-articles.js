#!/usr/bin/env node
'use strict';

/**
 * scripts/seed-articles.js
 * Populates the DynamoDB table with Learn article data.
 * Usage: node scripts/seed-articles.js --env=local
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, BatchWriteCommand } = require('@aws-sdk/lib-dynamodb');

const args = process.argv.slice(2).reduce((acc, a) => {
  const [k, v] = a.replace('--', '').split('=');
  acc[k] = v;
  return acc;
}, {});

const ENV   = args.env ?? 'local';
const TABLE = `bloom-finance-${ENV}`;

const client = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    region: 'us-east-1',
    ...(ENV === 'local' && {
      endpoint: 'http://localhost:8000',
      credentials: { accessKeyId: 'local', secretAccessKey: 'local' },
    }),
  }),
  { marshallOptions: { removeUndefinedValues: true } }
);

// ─── Article definitions ──────────────────────────────────────
const ARTICLES = [
  {
    slug: 'what-is-investing',
    title: 'What is Investing? A Beginner\'s Guide',
    excerpt: 'Learn the basics of investing and why starting early is the single best financial decision you can make.',
    category: 'basics',
    tags: ['beginner', 'intro', 'wealth'],
    difficulty: 'Beginner',
    readingMinutes: 5,
    views: 14_200,
    featured: true,
    publishedAt: '2025-01-10T08:00:00Z',
    authorName: 'Bloom Editorial',
    coverImage: '/learn/covers/what-is-investing.jpg',
    body: `<h2>What is investing?</h2>
<p>Investing means putting your money to work — buying assets that you expect to grow in value over time. Unlike saving (where your money sits in a bank earning minimal interest), investing puts capital into stocks, bonds, ETFs, or real estate that historically outpace inflation.</p>
<h2>Why start early?</h2>
<p>The most powerful force in investing is <strong>compound growth</strong> — your returns earning returns. Someone who invests $200/month from age 22 will typically accumulate more wealth by retirement than someone who invests $400/month starting at 35, even though they invested less money in absolute terms.</p>
<h2>Key principles</h2>
<ul>
  <li><strong>Diversify</strong> — don't put all eggs in one basket</li>
  <li><strong>Stay the course</strong> — short-term volatility is normal</li>
  <li><strong>Keep costs low</strong> — fees compound just like returns</li>
  <li><strong>Invest regularly</strong> — dollar-cost averaging reduces timing risk</li>
</ul>`,
  },
  {
    slug: 'etfs-explained',
    title: 'ETFs Explained: What They Are and Why Experts Love Them',
    excerpt: 'Exchange-traded funds offer instant diversification, low fees, and simplicity. Here\'s everything you need to know.',
    category: 'etfs',
    tags: ['etf', 'diversification', 'index-funds'],
    difficulty: 'Beginner',
    readingMinutes: 7,
    views: 9_800,
    featured: true,
    publishedAt: '2025-01-15T08:00:00Z',
    authorName: 'Bloom Editorial',
    coverImage: '/learn/covers/etfs.jpg',
    body: `<h2>What is an ETF?</h2>
<p>An exchange-traded fund (ETF) is a basket of securities that trades on a stock exchange. Buy one share of SPY and you instantly own a tiny slice of 500 of America's biggest companies — Apple, Microsoft, Amazon, and more.</p>
<h2>Why ETFs beat picking stocks</h2>
<p>Study after study shows that most actively managed funds underperform simple index ETFs over a 10-year period. The reason: fees. ETFs like VTI charge as little as 0.03% per year, vs 1%+ for actively managed alternatives.</p>`,
  },
  {
    slug: 'risk-and-reward',
    title: 'Understanding Risk: What Every Investor Must Know',
    excerpt: 'Higher potential returns always come with higher risk. Learn how to find the right balance for your life stage.',
    category: 'risk',
    tags: ['risk', 'portfolio', 'fundamentals'],
    difficulty: 'Beginner',
    readingMinutes: 6,
    views: 7_400,
    featured: false,
    publishedAt: '2025-01-20T08:00:00Z',
    authorName: 'Bloom Editorial',
    coverImage: '/learn/covers/risk.jpg',
    body: `<h2>The risk-return tradeoff</h2>
<p>Every investment involves tradeoffs. Cash in a savings account is safe but earns little. Stocks can lose 30% in a bad year — but also return 30% in a good one. Your job as an investor is to find the risk level that matches both your <em>financial goals</em> and your <em>emotional tolerance</em>.</p>`,
  },
  {
    slug: 'compound-interest-magic',
    title: 'The Magic of Compound Interest',
    excerpt: 'Einstein reportedly called compound interest the eighth wonder of the world. Here\'s why he was right.',
    category: 'basics',
    tags: ['compound-interest', 'long-term', 'beginner'],
    difficulty: 'Beginner',
    readingMinutes: 4,
    views: 11_300,
    featured: false,
    publishedAt: '2025-02-01T08:00:00Z',
    authorName: 'Bloom Editorial',
    coverImage: '/learn/covers/compound.jpg',
    body: `<p>If you invest $1,000 and earn 8% per year, after year 1 you have $1,080. In year 2, you earn 8% on $1,080 — not just $1,000. This snowball effect is compound interest.</p>`,
  },
  {
    slug: 'bonds-101',
    title: 'Bonds 101: The Steady Side of Your Portfolio',
    excerpt: 'Bonds are the steady counterweight to stock volatility. Understand how they work and when to hold them.',
    category: 'bonds',
    tags: ['bonds', 'fixed-income', 'stability'],
    difficulty: 'Intermediate',
    readingMinutes: 8,
    views: 4_900,
    featured: false,
    publishedAt: '2025-02-10T08:00:00Z',
    authorName: 'Bloom Editorial',
    coverImage: '/learn/covers/bonds.jpg',
    body: `<p>When you buy a bond, you're lending money to a government or corporation. In exchange, they promise to pay you interest (the coupon) and return your principal at maturity. Bonds are less volatile than stocks, which is why they're used to reduce portfolio risk.</p>`,
  },
  {
    slug: 'crypto-investing-basics',
    title: 'Crypto Basics: Opportunity and Risk',
    excerpt: 'Cryptocurrencies offer high potential — and high volatility. Here\'s a rational framework for including crypto in your portfolio.',
    category: 'crypto',
    tags: ['crypto', 'bitcoin', 'risk', 'advanced'],
    difficulty: 'Intermediate',
    readingMinutes: 10,
    views: 8_100,
    featured: false,
    publishedAt: '2025-02-18T08:00:00Z',
    authorName: 'Bloom Editorial',
    coverImage: '/learn/covers/crypto.jpg',
    body: `<p>Crypto assets like Bitcoin and Ethereum are highly volatile. Most financial advisors suggest keeping crypto exposure to 1-5% of a portfolio for most investors. This provides upside exposure while limiting potential downside impact.</p>`,
  },
];

function buildItems(article) {
  const now  = new Date().toISOString();
  return [
    // META row (list view — no body)
    {
      PutRequest: {
        Item: {
          PK:             `ARTICLE#${article.slug}`,
          SK:             'META',
          slug:           article.slug,
          title:          article.title,
          excerpt:        article.excerpt,
          category:       article.category,
          tags:           article.tags,
          difficulty:     article.difficulty,
          readingMinutes: article.readingMinutes,
          views:          article.views,
          featured:       article.featured,
          publishedAt:    article.publishedAt,
          authorName:     article.authorName,
          coverImage:     article.coverImage ?? null,
          createdAt:      now,
          updatedAt:      now,
        },
      },
    },
    // CONTENT row (full body — only fetched on detail view)
    {
      PutRequest: {
        Item: {
          PK:        `ARTICLE#${article.slug}`,
          SK:        'CONTENT',
          slug:      article.slug,
          body:      article.body,
          createdAt: now,
          updatedAt: now,
        },
      },
    },
  ];
}

async function seed() {
  console.log(`\n📚 Seeding articles → ${TABLE}\n`);

  const allItems = ARTICLES.flatMap(buildItems);
  const CHUNK    = 25;

  for (let i = 0; i < allItems.length; i += CHUNK) {
    const chunk = allItems.slice(i, i + CHUNK);
    await client.send(new BatchWriteCommand({ RequestItems: { [TABLE]: chunk } }));
    console.log(`  ✓ Wrote ${Math.min(i + CHUNK, allItems.length)} / ${allItems.length} items`);
  }

  console.log(`\n✅ Seeded ${ARTICLES.length} articles (${allItems.length} total rows)\n`);
}

seed().catch(err => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
