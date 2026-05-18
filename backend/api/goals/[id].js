/**
 * DELETE /api/goals/[id]
 * Delete a financial goal
 */

const { supabaseUser } = require('../../_lib/supabaseUser')
const { sendOk, sendUnauthorized, sendNotFound, handleSupabaseError } = require('../../_lib/response')

module.exports = async (req, res) => {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { id } = req.query

    if (!id) {
      return res.status(400).json({ error: 'Goal ID is required' })
    }

    const supabase = supabaseUser(req)
    const { data: user, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return sendUnauthorized(res, 'User not authenticated')
    }

    // Delete goal
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      if (error.code === 'PGRST116') {
        return sendNotFound(res, 'Goal not found')
      }
      return handleSupabaseError(res, error)
    }

    return sendOk(res, { message: 'Goal deleted successfully' })
  } catch (error) {
    console.error('Error deleting goal:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
