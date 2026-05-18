/**
 * POST /api/portfolios/[id]/invest
 * Invest in a specific portfolio
 */

import supabaseUser from '../../../_lib/supabaseUser.js'
import { sendOk, sendUnauthorized, sendNotFound, sendBadRequest, sendInternalError } from '../../../_lib/response.js'

export default async function handler(req, res) {
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
        const { amount } = req.body

        if (!portfolio_id || !amount || amount <= 0) {
            return sendBadRequest(res, 'Missing or invalid portfolio_id or amount')
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

        // Create transaction
        const { data: transaction, error: txError } = await supabase
            .from('transactions')
            .insert({
                user_id: user.id,
                type: 'investment',
                amount,
                portfolio_id,
                status: 'completed',
            })
            .select()
            .single()

        if (txError) {
            console.error('Transaction create error:', txError)
            return sendInternalError(res, txError.message)
        }

        return sendOk(res, transaction)
    } catch (error) {
        console.error('Handler error:', error)
        return sendInternalError(res, error.message)
    }
}
