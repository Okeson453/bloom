/**
 * GET /api/markets/indices
 * Get market indices data
 */

import supabaseUser from '../../_lib/supabaseUser.js'
import { sendOk, sendUnauthorized } from '../../_lib/response.js'

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

    // Mock indices data - in production, fetch from market data API
    const indices = [
      {
        symbol: '^GSPC',
        name: 'S&P 500',
        price: 5000.5,
        change: 25.3,
        changePercent: 0.51,
      },
      {
        symbol: '^IXIC',
        name: 'NASDAQ Composite',
        price: 15500.2,
        change: 150.8,
        changePercent: 0.98,
      },
      {
        symbol: '^DJI',
        name: 'Dow Jones Industrial',
        price: 42000.1,
        change: 180.5,
        changePercent: 0.43,
      },
    ]

    return sendOk(res, { indices })
  } catch (error) {
    console.error('Error fetching indices:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
