/**
 * POST /api/goals/create
 * Create a new financial goal
 */

import supabaseUser from '../_lib/supabaseUser.js'
import { sendOk, sendUnauthorized, sendBadRequest, sendInternalError } from '../_lib/response.js'
import { withCors } from '../_lib/cors.js'

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const supabase = supabaseUser(req)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return sendUnauthorized(res, 'User not authenticated')
    }

    const { name, target_amount, deadline, category, notes } = req.body

    if (!name || !target_amount || !deadline) {
      return sendBadRequest(res, 'Missing required fields: name, target_amount, deadline')
    }

    // Create goal
    const { data: goal, error: goalError } = await supabase
      .from('goals')
      .insert({
        user_id: user.id,
        name,
        target_amount,
        deadline,
        category,
        notes,
        current_amount: 0,
      })
      .select()
      .single()

    if (goalError) {
      console.error('Goal create error:', goalError)
      return sendInternalError(res, goalError.message)
    }

    return sendOk(res, { goal })
  } catch (error) {
    console.error('Handler error:', error)
    return sendInternalError(res, error.message)
  }
}

export default withCors(handler)
