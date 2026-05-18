/**
 * GET /api/portfolios/[id]
 * Get a specific portfolio by ID
 */

import supabaseUser from '../../_lib/supabaseUser.js'
import { sendOk, sendUnauthorized, sendNotFound, sendInternalError } from '../../_lib/response.js'

export default async function handler(req, res) {
    const { id } = req.query

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' })
    }

    if (!id) {
        return res.status(400).json({ error: 'Portfolio ID is required' })
    }

    try {
        const supabase = supabaseUser(req)
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return sendUnauthorized(res, 'User not authenticated')
        }

        // Fetch portfolio with assets
        const { data: portfolio, error: portfolioError } = await supabase
            .from('portfolios')
            .select('*, portfolio_assets(*)')
            .eq('id', id)
            .eq('user_id', user.id)
            .single()

        if (portfolioError || !portfolio) {
            console.error('Portfolio fetch error:', portfolioError)
            return sendNotFound(res, 'Portfolio')
        }

        return sendOk(res, { portfolio })
    } catch (error) {
        console.error('Handler error:', error)
        return sendInternalError(res, error.message)
    }
}
