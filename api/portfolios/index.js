/**
 * GET /api/portfolios
 * List user's portfolios
 */

import supabaseUser from '../_lib/supabaseUser.js'
import { sendOk, sendUnauthorized, sendInternalError } from '../_lib/response.js'
import { withCors } from '../_lib/cors.js'

async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' })
    }

    try {
        const supabase = supabaseUser(req)
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return sendUnauthorized(res, 'User not authenticated')
        }

        // Fetch portfolios with related assets
        const { data: portfolios, error: portfoliosError } = await supabase
            .from('portfolios')
            .select('*, portfolio_assets(*)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (portfoliosError) {
            console.error('Portfolios fetch error:', portfoliosError)
            return sendInternalError(res, portfoliosError.message)
        }

        return sendOk(res, { portfolios: portfolios || [] })
    } catch (error) {
        console.error('Handler error:', error)
        return sendInternalError(res, error.message)
    }
}

export default withCors(handler)
