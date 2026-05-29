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

    // Get the authorization token from the request
    const authHeader = req.headers.authorization
    let customHeaders = {}

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.slice(7)
        // Pass token via Authorization header to createClient
        customHeaders = {
            Authorization: authHeader,
        }
    }

    // Create client with custom headers that include auth token
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
            headers: customHeaders,
        },
    })

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
