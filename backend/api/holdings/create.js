/**
 * POST /api/holdings
 * Create or update holdings
 */

import supabaseUser from '../../_lib/supabaseUser.js'
import { sendOk, sendUnauthorized, handleSupabaseError } from '../../_lib/response.js'
import { withCors } from '../../_lib/cors.js'

export default withCors(async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const supabase = supabaseUser(req)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return sendUnauthorized(res, 'User not authenticated')
    }

    const { symbol, quantity, average_cost } = req.body

    // Upsert holding
    const { data: holding, error } = await supabase
      .from('holdings')
      .upsert(
        {
          user_id: user.id,
          symbol,
          quantity,
          average_cost,
        },
        { onConflict: 'user_id,symbol' }
      )
      .select()
      .single()

    if (error) {
      return handleSupabaseError(res, error)
    }

    return sendOk(res, { holding })
  } catch (error) {
    console.error('Error creating holding:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})
