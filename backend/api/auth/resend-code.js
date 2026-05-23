/**
 * POST /api/auth/resend-code
 * Resend verification code to email
 */

import { createClient } from '@supabase/supabase-js'
import { sendOk, sendBadRequest } from '../../_lib/response.js'
import { withCors } from '../../_lib/cors.js'

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

    // Resend verification code for signup
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    })

    if (error) {
      return sendBadRequest(res, error.message)
    }

    return sendOk(res, {
      message: 'Verification code resent',
    })
  } catch (error) {
    console.error('Error in resend code:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default withCors(handler)
