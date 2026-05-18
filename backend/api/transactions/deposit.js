/**
 * POST /api/transactions/deposit
 * Create a deposit transaction
 */

const { supabaseUser } = require('../../_lib/supabaseUser')
const { validate, createTransactionSchema } = require('../../_lib/validate')
const {
  sendCreated,
  sendUnauthorized,
  sendBadRequest,
  handleSupabaseError,
} = require('../../_lib/response')

module.exports = async (req, res) => {
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
    const { data: user, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return sendUnauthorized(res, 'User not authenticated')
    }

    // Create deposit transaction
    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'deposit',
        ...validatedData,
      })
      .select()
      .single()

    if (error) {
      return handleSupabaseError(res, error)
    }

    return sendCreated(res, { transaction })
  } catch (error) {
    console.error('Error creating deposit:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
