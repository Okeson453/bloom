/**
 * POST /api/transactions/deposit
 * Create a deposit transaction
 */

import supabaseUser from '../_lib/supabaseUser.js'
import { validate, createTransactionSchema } from '../_lib/validate.js'
import {
  sendCreated,
  sendUnauthorized,
  sendBadRequest,
  handleSupabaseError,
} from '../_lib/response.js'
import { withCors } from '../_lib/cors.js'

export default withCors(async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Validate request body
    const schema = createTransactionSchema()
    const { error: validationError, value: validatedData } = validate(req.body, schema)

    if (validationError) {
      const details = validationError.details.reduce((acc, err) => {
        acc[err.path.join('.')] = err.message
        return acc
      }, {})
      return sendBadRequest(res, 'Validation failed', details)
    }

    const supabase = supabaseUser(req)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return sendUnauthorized(res, 'User not authenticated')
    }

    // Create deposit transaction
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'deposit',
        amount: validatedData.amount,
        portfolio_id: validatedData.portfolio_id || null,
        description: validatedData.description || null,
        status: 'completed',
      })
      .select()
      .single()

    if (txError) {
      return handleSupabaseError(res, txError)
    }

    // Update user's available balance
    const { data: userWallet, error: walletError } = await supabase
      .from('user_wallets')
      .select('available_balance')
      .eq('user_id', user.id)
      .single()

    if (!walletError && userWallet) {
      const newBalance = (userWallet.available_balance || 0) + validatedData.amount
      await supabase
        .from('user_wallets')
        .update({ available_balance: newBalance })
        .eq('user_id', user.id)
    }

    // Update portfolio total_invested if portfolio_id is provided
    if (validatedData.portfolio_id) {
      const { data: portfolio, error: portfolioError } = await supabase
        .from('portfolios')
        .select('total_invested')
        .eq('id', validatedData.portfolio_id)
        .eq('user_id', user.id)
        .single()

      if (!portfolioError && portfolio) {
        const newTotal = (portfolio.total_invested || 0) + validatedData.amount
        await supabase
          .from('portfolios')
          .update({ total_invested: newTotal })
          .eq('id', validatedData.portfolio_id)
      }
    }

    return sendCreated(res, { transaction })
  } catch (error) {
    console.error('Error creating deposit:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})
