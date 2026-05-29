/**
 * GET /api/transactions
 * Get user's transactions
 */

import supabaseUser from '../_lib/supabaseUser.js'
import { sendOk, sendUnauthorized, sendInternalError } from '../_lib/response.js'
import { withCors } from '../_lib/cors.js'

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const supabase = supabaseUser(req)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return sendUnauthorized(res, 'User not authenticated')
    }

    const { limit = 50, offset = 0 } = req.query

    // Fetch transactions
    const { data: transactions, error: txError, count } = await supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)

    if (txError) {
      console.error('Transactions fetch error:', txError)
      return sendInternalError(res, txError.message)
    }

    return sendOk(res, {
      transactions: transactions || [],
      total: count,
      limit: parseInt(limit),
      offset: parseInt(offset),
    })
  } catch (error) {
    console.error('Handler error:', error)
    return sendInternalError(res, error.message)
  }
}

export default withCors(handler)
