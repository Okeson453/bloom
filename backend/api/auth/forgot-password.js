/**
 * POST /api/auth/forgot-password
 * Request password reset
 */

import { getSupabaseAdmin } from '../../_lib/supabase.js'
import { sendOk, sendBadRequest } from '../../_lib/response.js'

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { email } = req.body

        if (!email) {
            return sendBadRequest(res, 'Email is required')
        }

        const supabase = getSupabaseAdmin()

        // Send password reset email
        const { error } = await supabase.auth.resetPasswordForEmail(email)

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
