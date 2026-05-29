/**
 * POST /api/auth/confirm-password
 * Confirm password reset with code
 */

import { createClient } from '@supabase/supabase-js'
import { sendOk, sendBadRequest, sendUnauthorized } from '../_lib/response.js'
import { withCors } from '../_lib/cors.js'

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, code, newPassword } = req.body

    if (!email || !code || !newPassword) {
      return sendBadRequest(res, 'Email, code, and new password are required')
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    )

    // Verify OTP and update password
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'recovery',
    })

    if (error) {
      return sendUnauthorized(res, error.message)
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      return sendBadRequest(res, updateError.message)
    }

    return sendOk(res, {
      message: 'Password updated successfully',
    })
  } catch (error) {
    console.error('Error in confirm password:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default withCors(handler)
