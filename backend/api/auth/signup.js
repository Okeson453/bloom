/**
 * POST /api/auth/signup
 * Register a new user with email verification
 */

import { createClient } from '@supabase/supabase-js'
import { sendCreated, sendBadRequest } from '../../_lib/response.js'
import { withCors } from '../../_lib/cors.js'

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, password, given_name, family_name } = req.body

    if (!email || !password) {
      return sendBadRequest(res, 'Email and password are required')
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    )

    // Use standard signup (triggers email verification OTP automatically)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          given_name,
          family_name,
        },
      },
    })

    if (error) {
      return sendBadRequest(res, error.message)
    }

    // Create user profile in users table
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        email,
        full_name: `${given_name || ''} ${family_name || ''}`.trim(),
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      return sendBadRequest(
        res,
        'User created but profile setup failed: ' + profileError.message
      )
    }

    return sendCreated(res, {
      userId: data.user.id,
      email: data.user.email,
      message: 'User created. Please check your email for the verification code.',
    })
  } catch (error) {
    console.error('Error in signup:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default withCors(handler)
