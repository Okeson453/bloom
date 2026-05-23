/**
 * GET /api/goals
 * Get user's financial goals
 */

import supabaseUser from '../../_lib/supabaseUser.js'
import { sendOk, sendUnauthorized, sendInternalError } from '../../_lib/response.js'
import { withCors } from '../../_lib/cors.js'

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

    // Fetch goals
    const { data: goals, error: goalsError } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (goalsError) {
      console.error('Goals fetch error:', goalsError)
      return sendInternalError(res, goalsError.message)
    }

    return sendOk(res, { goals: goals || [] })
  } catch (error) {
    console.error('Handler error:', error)
    return sendInternalError(res, error.message)
  }
}

export default withCors(handler)
