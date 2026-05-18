#!/usr/bin/env node
'use strict';

/**
 * scripts/seed-portfolios.js
 *
 * One-time: populates the DynamoDB table with portfolio catalog data.
 * Usage:
 *   node scripts/seed-portfolios.js --env=local
 *   node scripts/seed-portfolios.js --env=staging
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

// ─── Portfolio definitions ────────────────────────────────────
const PORTFOLIOS = [
  {
    id: 'conservative',
    name: 'Conservative',
    description: 'Capital preservation with steady income. Mostly bonds and stable equities.',
    riskLevel: 1,
    expectedReturn: 4.5,
    volatility: 'Low',
    minInvestment: 10,
    tags: ['income', 'bonds', 'low-risk'],
    assets: [
      { symbol: 'AGG',  weight: 0.40, name: 'US Aggregate Bond ETF' },
      { symbol: 'BND',  weight: 0.20, name: 'Vanguard Bond ETF' },
      { symbol: 'VTI',  weight: 0.20, name: 'Total Stock Market' },
      { symbol: 'GLD',  weight: 0.10, name: 'Gold ETF' },
      { symbol: 'TLT',  weight: 0.10, name: 'Long-Term Treasury' },
    ],
  },
  {
    id: 'moderate',
    name: 'Moderate',
    description: 'Balanced growth and stability. A classic 60/40 portfolio with a modern twist.',
    riskLevel: 2,
    expectedReturn: 7.2,
    volatility: 'Medium',
    minInvestment: 10,
    tags: ['balanced', 'growth', 'diversified'],
    assets: [
      { symbol: 'SPY',  weight: 0.35, name: 'S&P 500 ETF' },
      { symbol: 'QQQ',  weight: 0.15, name: 'NASDAQ 100 ETF' },
      { symbol: 'AGG',  weight: 0.25, name: 'US Aggregate Bond' },
      { symbol: 'EFA',  weight: 0.15, name: 'International Developed Markets' },
      { symbol: 'GLD',  weight: 0.10, name: 'Gold ETF' },
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    description: 'Long-term growth through diversified equity exposure. Accepts short-term swings.',
    riskLevel: 3,
    expectedReturn: 10.5,
    volatility: 'Medium-High',
    minInvestment: 10,
    tags: ['growth', 'equity', 'long-term'],
    assets: [
      { symbol: 'QQQ',  weight: 0.30, name: 'NASDAQ 100 ETF' },
      { symbol: 'SPY',  weight: 0.25, name: 'S&P 500 ETF' },
      { symbol: 'VTI',  weight: 0.20, name: 'Total Stock Market' },
      { symbol: 'EEM',  weight: 0.15, name: 'Emerging Markets ETF' },
      { symbol: 'AGG',  weight: 0.10, name: 'US Aggregate Bond' },
    ],
  },
  {
    id: 'aggressive-growth',
    name: 'Aggressive Growth',
    description: 'Maximum growth potential. High allocation to tech and growth stocks.',
    riskLevel: 4,
    expectedReturn: 15.0,
    volatility: 'High',
    minInvestment: 50,
    tags: ['aggressive', 'tech', 'growth', 'high-risk'],
    assets: [
      { symbol: 'QQQ',  weight: 0.40, name: 'NASDAQ 100 ETF' },
      { symbol: 'NVDA', weight: 0.15, name: 'NVIDIA Corp' },
      { symbol: 'MSFT', weight: 0.15, name: 'Microsoft Corp' },
      { symbol: 'AAPL', weight: 0.15, name: 'Apple Inc' },
      { symbol: 'EEM',  weight: 0.15, name: 'Emerging Markets ETF' },
    ],
  },
];

// ─── Build DynamoDB items ─────────────────────────────────────
function buildItems(portfolio) {
  const now   = new Date().toISOString();
  const items = [];

  // META row
  items.push({
    PutRequest: {
      Item: {
        PK:              `PORTFOLIO#${portfolio.id}`,
        SK:              'META',
        portfolioId:     portfolio.id,
        name:            portfolio.name,
        description:     portfolio.description,
        riskLevel:       portfolio.riskLevel,
        expectedReturn:  portfolio.expectedReturn,
        volatility:      portfolio.volatility,
        minInvestment:   portfolio.minInvestment,
        tags:            portfolio.tags,
        assetCount:      portfolio.assets.length,
        createdAt:       now,
        updatedAt:       now,
      },
    },
  });

  // ASSET# rows
  for (const asset of portfolio.assets) {
    items.push({
      PutRequest: {
        Item: {
          PK:          `PORTFOLIO#${portfolio.id}`,
          SK:          `ASSET#${asset.symbol}`,
          portfolioId: portfolio.id,
          symbol:      asset.symbol,
          name:        asset.name,
          weight:      asset.weight,
          lastPrice:   null,
          createdAt:   now,
          updatedAt:   now,
        },
      },
    });
  }

  return items;
}

async function seed() {
  console.log(`\n🌱 Seeding portfolios → ${TABLE}\n`);

  const allItems = PORTFOLIOS.flatMap(buildItems);

  // BatchWriteItem — 25 items per call
  const CHUNK = 25;
  for (let i = 0; i < allItems.length; i += CHUNK) {
    const chunk = allItems.slice(i, i + CHUNK);
    await client.send(new BatchWriteCommand({ RequestItems: { [TABLE]: chunk } }));
    console.log(`  ✓ Wrote ${Math.min(i + CHUNK, allItems.length)} / ${allItems.length} items`);
  }

  console.log(`\n✅ Seeded ${PORTFOLIOS.length} portfolios (${allItems.length} total rows)\n`);
}

seed().catch(err => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
