/**
 * GET/PUT/DELETE /api/users/me
 * Get, update, or delete current user profile
 */

import supabaseUser from '../_lib/supabaseUser.js'
import { sendOk, sendUnauthorized, sendBadRequest, sendInternalError } from '../_lib/response.js'
import { withCors } from '../_lib/cors.js'

async function handler(req, res) {
    if (req.method !== 'GET' && req.method !== 'PUT' && req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const supabase = supabaseUser(req)
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return sendUnauthorized(res, 'User not authenticated')
        }

        if (req.method === 'GET') {
            // Get user profile
            const { data: profile, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single()

            if (error) {
                return sendInternalError(res, error.message)
            }

            return sendOk(res, {
                user: {
                    id: user.id,
                    email: user.email,
                    email_confirmed_at: user.email_confirmed_at,
                    user_metadata: user.user_metadata,
                    profile,
                },
            })
        }

        if (req.method === 'PUT') {
            // Update user profile
            const { given_name, family_name, phone_number } = req.body

            const { error } = await supabase
                .from('users')
                .update({
                    full_name: `${given_name || ''} ${family_name || ''}`.trim(),
                    phone_number,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', user.id)

            if (error) {
                return sendBadRequest(res, error.message)
            }

            return sendOk(res, { message: 'Profile updated successfully' })
        }

        if (req.method === 'DELETE') {
            // Delete user account (requires admin client)
            try {
                const { createClient } = await import('@supabase/supabase-js')
                const admin = createClient(
                    process.env.SUPABASE_URL,
                    process.env.SUPABASE_SERVICE_ROLE_KEY
                )

                // Delete user profile first
                await admin
                    .from('users')
                    .delete()
                    .eq('id', user.id)

                // Delete auth user
                const { error } = await admin.auth.admin.deleteUser(user.id)

                if (error) {
                    return sendBadRequest(res, error.message)
                }

                return sendOk(res, { message: 'Account deleted successfully' })
            } catch (error) {
                console.error('Error deleting user:', error)
                return sendBadRequest(res, 'Failed to delete account: ' + error.message)
            }
        }
    } catch (error) {
        console.error('Error in /users/me:', error)
        return res.status(500).json({ error: 'Internal server error' })
    }
}

export default withCors(handler)
