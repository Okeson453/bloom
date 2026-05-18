/**
 * GET /api/markets/search
 * Search for market data by symbol
 */

import supabaseUser from '../../_lib/supabaseUser.js'
import { sendOk, sendBadRequest, sendUnauthorized } from '../../_lib/response.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const supabase = supabaseUser(req)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return sendUnauthorized(res, 'User not authenticated')
    }

    const { q } = req.query

    if (!q || typeof q !== 'string' || q.length < 1) {
      return sendBadRequest(res, 'Search query is required (minimum 1 character)')
    }

    // Mock search results - in production, query external market data API
    const mockResults = [
      { symbol: 'AAPL', name: 'Apple Inc.', price: 180.5 },
      { symbol: 'MSFT', name: 'Microsoft Corporation', price: 380.2 },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.3 },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 175.8 },
      { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 600.4 },
    ].filter((item) => item.symbol.includes(q.toUpperCase()) || item.name.includes(q))

    return sendOk(res, { results: mockResults })
  } catch (error) {
    console.error('Error searching market data:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
