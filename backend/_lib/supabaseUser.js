import { createClient } from '@supabase/supabase-js'

/**
 * Create an authenticated Supabase client from the request authorization header
 */
function supabaseUser(req) {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase credentials')
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  // Get the authorization token from the request
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    supabase.auth.session = { access_token: token }
  }

  return supabase
}

// Export for both ESM and CommonJS
export default supabaseUser
export { supabaseUser }

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = supabaseUser
  module.exports.supabaseUser = supabaseUser
}
