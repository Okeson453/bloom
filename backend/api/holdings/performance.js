/**
 * GET /api/holdings/performance
 * Get holding performance metrics
 */

import supabaseUser from '../../_lib/supabaseUser.js'
import { buildTimeSeries } from './aggregator.js'
import { sendOk, sendUnauthorized, handleSupabaseError } from '../../_lib/response.js'
import { withCors } from '../../_lib/cors.js'

export default withCors(async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const supabase = supabaseUser(req)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return sendUnauthorized(res, 'User not authenticated')
    }

    // Fetch snapshots
    const { data: snapshots, error } = await supabase
      .from('snapshots')
      .select('*')
      .eq('user_id', user.id)
      .order('snapshot_date', { ascending: true })

    if (error) {
      return handleSupabaseError(res, error)
    }

    // Build time series
    const timeSeries = buildTimeSeries(snapshots || [], 'total_value')

    return sendOk(res, { timeSeries })
  } catch (error) {
    console.error('Error fetching performance:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})
