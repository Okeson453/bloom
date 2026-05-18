/**
 * POST /api/learn/progress
 * Track user's learning progress
 */

const { supabaseUser } = require('../../_lib/supabaseUser')
const { sendOk, sendUnauthorized, handleSupabaseError } = require('../../_lib/response')

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const supabase = supabaseUser(req)
    const { data: user, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return sendUnauthorized(res, 'User not authenticated')
    }

    const { article_id, completed, progress_percent } = req.body

    // Upsert progress record
    const { data: progress, error } = await supabase
      .from('learn_progress')
      .upsert(
        {
          user_id: user.id,
          article_id,
          completed: completed || false,
          progress_percent: progress_percent || 0,
          completed_at: completed ? new Date().toISOString() : null,
        },
        { onConflict: 'user_id,article_id' }
      )
      .select()
      .single()

    if (error) {
      return handleSupabaseError(res, error)
    }

    return sendOk(res, { progress })
  } catch (error) {
    console.error('Error tracking progress:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
