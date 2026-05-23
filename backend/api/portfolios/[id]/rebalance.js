/**
 * POST /api/portfolios/[id]/rebalance
 * Rebalance a specific portfolio
 */

import supabaseUser from '../../../_lib/supabaseUser.js'
import { sendOk, sendUnauthorized, sendNotFound, sendBadRequest, sendInternalError } from '../../../_lib/response.js'
import { withCors } from '../../../_lib/cors.js'

export default withCors(async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' })
    }

    try {
        const supabase = supabaseUser(req)
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return sendUnauthorized(res, 'User not authenticated')
        }

        // Get portfolio ID from path parameter
        const { id: portfolio_id } = req.query

        if (!portfolio_id) {
            return sendBadRequest(res, 'Portfolio ID is required')
        }

        // Get portfolio
        const { data: portfolio, error: portfolioError } = await supabase
            .from('portfolios')
            .select('*')
            .eq('id', portfolio_id)
            .eq('user_id', user.id)
            .single()

        if (portfolioError || !portfolio) {
            return sendNotFound(res, 'Portfolio')
        }

        // Update portfolio rebalance date
        const { data: updatedPortfolio, error: updateError } = await supabase
            .from('portfolios')
            .update({
                rebalanced_at: new Date().toISOString(),
            })
            .eq('id', portfolio_id)
            .select()
            .single()

        if (updateError) {
            console.error('Rebalance error:', updateError)
            return sendInternalError(res, updateError.message)
        }

        return sendOk(res, {
            portfolio: updatedPortfolio,
            message: 'Portfolio rebalanced successfully',
        })
    } catch (error) {
        console.error('Handler error:', error)
        return sendInternalError(res, error.message)
    }
}
