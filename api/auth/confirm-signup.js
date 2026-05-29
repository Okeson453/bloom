/**
 * POST /api/auth/confirm-signup
 * Confirm email verification code
 */

import { createClient } from '@supabase/supabase-js'
import { sendOk, sendBadRequest, sendUnauthorized } from '../_lib/response.js'
import { withCors } from '../_lib/cors.js'

async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { email, code } = req.body

        if (!email || !code) {
            return sendBadRequest(res, 'Email and verification code are required')
        }

        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY
        )

        // Verify OTP
        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token: code,
            type: 'email',
        })

        if (error) {
            return sendUnauthorized(res, error.message)
        }

        return sendOk(res, {
            message: 'Email verified successfully',
            user: {
                id: data.user.id,
                email: data.user.email,
            },
        })
    } catch (error) {
        console.error('Error in confirm signup:', error)
        return res.status(500).json({ error: 'Internal server error' })
    }
}

export default withCors(handler)
