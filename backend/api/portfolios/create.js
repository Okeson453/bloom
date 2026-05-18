/**
 * POST /api/portfolios/create
 * Create a new portfolio
 */

import supabaseUser from '../../_lib/supabaseUser.js'
import { sendOk, sendUnauthorized, sendBadRequest, sendInternalError } from '../../_lib/response.js'

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

        const { name, risk_level, description, assets } = req.body

        if (!name || !risk_level) {
            return sendBadRequest(res, 'Missing required fields: name, risk_level')
        }

        if (!['conservative', 'moderate', 'aggressive'].includes(risk_level)) {
            return sendBadRequest(res, 'Invalid risk_level')
        }

        // Create portfolio
        const { data: portfolio, error: portfolioError } = await supabase
            .from('portfolios')
            .insert({
                user_id: user.id,
                name,
                risk_level,
                description,
            })
            .select()
            .single()

        if (portfolioError) {
            console.error('Portfolio create error:', portfolioError)
            return sendInternalError(res, portfolioError.message)
        }

        // Add assets if provided
        if (assets && Array.isArray(assets) && assets.length > 0) {
            const assetRecords = assets.map(asset => ({
                portfolio_id: portfolio.id,
                symbol: asset.symbol,
                weight: asset.weight,
            }))

            const { error: assetsError } = await supabase
                .from('portfolio_assets')
                .insert(assetRecords)

            if (assetsError) {
                console.error('Assets insert error:', assetsError)
                return sendInternalError(res, assetsError.message)
            }
        }

        return sendOk(res, { portfolio })
    } catch (error) {
        console.error('Handler error:', error)
        return sendInternalError(res, error.message)
    }
}
