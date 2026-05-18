import { createClient } from '@supabase/supabase-js'

/**
 * Create an admin Supabase client using the service role key
 */
function getSupabaseAdmin() {
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceRoleKey) {
        throw new Error('Missing Supabase admin credentials')
    }

    return createClient(supabaseUrl, supabaseServiceRoleKey)
}

// Export for both ESM and CommonJS
export default getSupabaseAdmin
export { getSupabaseAdmin }

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = getSupabaseAdmin
    module.exports.getSupabaseAdmin = getSupabaseAdmin
}
