/**
 * POST /api/auth/confirm-signup
 * Confirm email verification code
 */

import { getSupabaseAdmin } from '../../_lib/supabase.js'
import { sendOk, sendBadRequest, sendUnauthorized } from '../../_lib/response.js'

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { email, code } = req.body

        if (!email || !code) {
            return sendBadRequest(res, 'Email and verification code are required')
        }

        const supabase = getSupabaseAdmin()

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
