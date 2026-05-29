/**
 * POST /api/auth/forgot-password
 * Request password reset
 */

import { createClient } from '@supabase/supabase-js'
import { sendOk, sendBadRequest } from '../_lib/response.js'
import { withCors } from '../_lib/cors.js'

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email } = req.body

    if (!email) {
      return sendBadRequest(res, 'Email is required')
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    )

    // Send password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${req.headers.origin || 'https://bloom-taupe-iota.vercel.app'}/auth/reset-password`,
    })

    if (error) {
      return sendBadRequest(res, error.message)
    }

    return sendOk(res, {
      message: 'Password reset instructions sent to email',
    })
  } catch (error) {
    console.error('Error in forgot password:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default withCors(handler)
