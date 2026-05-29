/**
 * POST /api/auth/logout
 * Sign out user (invalidate session)
 */

import supabaseUser from '../_lib/supabaseUser.js'
import { sendOk, sendUnauthorized } from '../_lib/response.js'
import { withCors } from '../_lib/cors.js'

async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const supabase = supabaseUser(req)
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return sendUnauthorized(res, 'User not authenticated')
        }

        // Sign out user
        const { error } = await supabase.auth.signOut()

        if (error) {
            console.error('Logout error:', error)
        }

        return sendOk(res, { message: 'Logged out successfully' })
    } catch (error) {
        console.error('Error in logout:', error)
        return res.status(500).json({ error: 'Internal server error' })
    }
}

export default withCors(handler)
