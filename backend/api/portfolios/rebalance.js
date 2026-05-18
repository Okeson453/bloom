/**
 * PUT /api/portfolios/rebalance
 * Rebalance portfolio assets
 */

import supabaseUser from '../../_lib/supabaseUser.js'
import { sendOk, sendUnauthorized, sendNotFound, sendBadRequest, sendInternalError } from '../../_lib/response.js'

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const supabase = supabaseUser(req)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return sendUnauthorized(res, 'User not authenticated')
    }

    const { portfolio_id, assets } = req.body

    if (!portfolio_id || !assets || !Array.isArray(assets)) {
      return sendBadRequest(res, 'Missing or invalid portfolio_id or assets')
    }

    // Verify portfolio ownership
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select('*')
      .eq('id', portfolio_id)
      .eq('user_id', user.id)
      .single()

    if (portfolioError || !portfolio) {
      return sendNotFound(res, 'Portfolio')
    }

    // Delete existing assets for this portfolio
    const { error: deleteError } = await supabase
      .from('portfolio_assets')
      .delete()
      .eq('portfolio_id', portfolio_id)

    if (deleteError) {
      console.error('Assets delete error:', deleteError)
      return sendInternalError(res, deleteError.message)
    }

    // Insert new assets
    const assetRecords = assets.map(asset => ({
      portfolio_id,
      symbol: asset.symbol,
      weight: asset.weight,
    }))

    const { error: insertError } = await supabase
      .from('portfolio_assets')
      .insert(assetRecords)

    if (insertError) {
      console.error('Assets insert error:', insertError)
      return sendInternalError(res, insertError.message)
    }

    return sendOk(res, { portfolio_id, assets: assetRecords })
  } catch (error) {
    console.error('Handler error:', error)
    return sendInternalError(res, error.message)
  }
}
