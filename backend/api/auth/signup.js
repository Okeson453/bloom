/**
 * POST /api/auth/signup
 * Register a new user
 */

import { getSupabaseAdmin } from '../../_lib/supabase.js'
import { sendCreated, sendBadRequest } from '../../_lib/response.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, password, given_name, family_name } = req.body

    if (!email || !password) {
      return sendBadRequest(res, 'Email and password are required')
    }

    const supabase = getSupabaseAdmin()

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        given_name,
        family_name,
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
      // Still return success since user was created in auth
    }

    return sendCreated(res, {
      userId: data.user.id,
      email: data.user.email,
      message: 'User created successfully. Please verify your email.',
    })
  } catch (error) {
    console.error('Error in signup:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
