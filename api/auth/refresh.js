/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */

import { createClient } from '@supabase/supabase-js'
import { sendOk, sendUnauthorized } from '../_lib/response.js'
import { withCors } from '../_lib/cors.js'

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { refresh_token } = req.body

    if (!refresh_token) {
      return sendUnauthorized(res, 'Refresh token is required')
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    )

    // Refresh session
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token,
    })

    if (error) {
      return sendUnauthorized(res, error.message)
    }

    return sendOk(res, {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      idToken: data.session.access_token,
    })
  } catch (error) {
    console.error('Error in refresh:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default withCors(handler)
