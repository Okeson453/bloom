// Scheduled function to refresh market prices every minute
// Triggers via pg_cron: SELECT cron.schedule('price-refresh', '* * * * *', 'SELECT net.http_post(...)')

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const marketDataApiKey = Deno.env.get('MARKET_DATA_API_KEY')
const marketDataBaseUrl = Deno.env.get('MARKET_DATA_BASE_URL')

const supabase = createClient(supabaseUrl!, supabaseServiceRoleKey!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

/**
 * Edge Function: Refresh market prices
 * Called every minute by pg_cron
 */
Deno.serve(async (_req) => {
  try {
    console.log('Starting price refresh job...')

    // Get unique symbols from portfolio_assets
    const { data: symbols, error: symbolError } = await supabase
      .from('portfolio_assets')
      .select('symbol')
      .distinct()

    if (symbolError) {
      console.error('Error fetching symbols:', symbolError)
      return new Response(JSON.stringify({ error: symbolError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (!symbols || symbols.length === 0) {
      console.log('No symbols to refresh')
      return new Response(JSON.stringify({ refreshed: 0 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const symbolList = symbols.map((s) => s.symbol)
    console.log(`Refreshing ${symbolList.length} symbols`)

    // In production, call real market data API
    // For now, generate mock prices
    const priceUpdates = symbolList.map((symbol: string) => ({
      symbol,
      price: Math.random() * 500 + 10,
      fetched_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 60 * 1000).toISOString(),
    }))

    // Upsert prices
    const { error: upsertError, data } = await supabase
      .from('price_cache')
      .upsert(priceUpdates, { onConflict: 'symbol' })

    if (upsertError) {
      console.error('Error upserting prices:', upsertError)
      return new Response(JSON.stringify({ error: upsertError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    console.log(`Successfully refreshed ${priceUpdates.length} prices`)

    return new Response(JSON.stringify({ refreshed: priceUpdates.length }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Price refresh error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
