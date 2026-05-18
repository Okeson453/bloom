/**
 * POST /api/auth/login
 * Authenticate user and return tokens
 */

import { createClient } from '@supabase/supabase-js'
import { sendOk, sendUnauthorized } from '../../_lib/response.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, password } = req.body

    if (!email || !password) {
      return sendUnauthorized(res, 'Email and password are required')
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    )

    // Sign in user
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return sendUnauthorized(res, error.message)
    }

    return sendOk(res, {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      idToken: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        user_metadata: data.user.user_metadata,
      },
    })
  } catch (error) {
    console.error('Error in login:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
