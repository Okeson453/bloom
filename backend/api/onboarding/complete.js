/**
 * POST /api/onboarding/complete
 * Mark onboarding as complete
 */

import supabaseUser from '../../_lib/supabaseUser.js'
import { sendOk, sendUnauthorized, handleSupabaseError } from '../../_lib/response.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const supabase = supabaseUser(req)
    const { data: user, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return sendUnauthorized(res, 'User not authenticated')
    }

    // Mark onboarding as complete
    const { data: onboarding, error } = await supabase
      .from('onboarding')
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return handleSupabaseError(res, error)
    }

    return sendOk(res, { onboarding })
  } catch (error) {
    console.error('Error completing onboarding:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
