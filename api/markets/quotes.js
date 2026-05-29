/**
 * GET /api/markets/quotes
 * Get market quotes for symbols
 */

import supabaseUser from '../_lib/supabaseUser.js'
import { sendOk, sendBadRequest, sendUnauthorized, sendInternalError } from '../_lib/response.js'
import { withCors } from '../_lib/cors.js'

export default withCors(async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const supabase = supabaseUser(req)

    // Authenticate the user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return sendUnauthorized(res, 'User not authenticated')
    }

    const { symbols } = req.query

    if (!symbols) {
      return sendBadRequest(res, 'Missing symbols parameter')
    }

    const symbolList = Array.isArray(symbols) ? symbols : [symbols]

    // Fetch cached prices
    const { data: prices, error: pricesError } = await supabase
      .from('price_cache')
      .select('*')
      .in('symbol', symbolList)

    if (pricesError) {
      console.error('Prices fetch error:', pricesError)
      return sendInternalError(res, pricesError.message)
    }

    // Check for stale prices (older than TTL)
    const ttl = parseInt(process.env.PRICE_CACHE_TTL_SECONDS || '60')
    const now = Date.now()
    const staleSymbols = prices
      .filter(p => new Date(p.fetched_at).getTime() < now - ttl * 1000)
      .map(p => p.symbol)

    return sendOk(res, {
      quotes: prices || [],
      stale: staleSymbols,
    })
  } catch (error) {
    console.error('Handler error:', error)
    return sendInternalError(res, error.message)
  }
})
