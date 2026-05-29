/**
 * PUT /api/portfolios/rebalance
 * Rebalance portfolio assets
 */

import supabaseUser from '../_lib/supabaseUser.js'
import { sendOk, sendUnauthorized, sendNotFound, sendBadRequest, sendInternalError } from '../_lib/response.js'
import { withCors } from '../_lib/cors.js'

async function handler(req, res) {
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

    // Fetch current assets for rollback if needed
    const { data: currentAssets, error: fetchError } = await supabase
      .from('portfolio_assets')
      .select('*')
      .eq('portfolio_id', portfolio_id)

    if (fetchError) {
      console.error('Assets fetch error:', fetchError)
      return sendInternalError(res, fetchError.message)
    }

    // Validate new assets before making any changes
    const assetRecords = assets.map(asset => {
      if (!asset.symbol || typeof asset.weight !== 'number' || asset.weight < 0 || asset.weight > 100) {
        throw new Error(`Invalid asset: ${JSON.stringify(asset)}`)
      }
      return {
        portfolio_id,
        symbol: asset.symbol,
        weight: asset.weight,
      }
    })

    // Validate total weight adds up to 100%
    const totalWeight = assetRecords.reduce((sum, a) => sum + a.weight, 0)
    if (Math.abs(totalWeight - 100) > 0.01) {
      return sendBadRequest(res, `Asset weights must sum to 100% (got ${totalWeight}%)`)
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
    const { error: insertError } = await supabase
      .from('portfolio_assets')
      .insert(assetRecords)

    if (insertError) {
      console.error('Assets insert error:', insertError)

      // Attempt rollback by restoring old assets
      if (currentAssets && currentAssets.length > 0) {
        const rollbackRecords = currentAssets.map(({ id, created_at, updated_at, ...asset }) => asset)
        await supabase.from('portfolio_assets').insert(rollbackRecords).catch(err => {
          console.error('Rollback failed:', err)
        })
      }

      return sendInternalError(res, insertError.message)
    }

    return sendOk(res, { portfolio_id, assets: assetRecords })
  } catch (error) {
    console.error('Handler error:', error)
    return sendInternalError(res, error.message)
  }
}

export default withCors(handler)
