// Scheduled function to create daily portfolio snapshots
// Triggers via pg_cron: SELECT cron.schedule('portfolio-snapshot', '0 0 * * *', 'SELECT net.http_post(...)')

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const supabase = createClient(supabaseUrl!, supabaseServiceRoleKey!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

/**
 * Edge Function: Create portfolio snapshots
 * Called daily at 00:00 UTC by pg_cron
 */
Deno.serve(async (_req) => {
  try {
    console.log('Starting portfolio snapshot job...')

    // Get all portfolios
    const { data: portfolios, error: portfolioError } = await supabase
      .from('portfolios')
      .select('id, user_id')

    if (portfolioError) {
      console.error('Error fetching portfolios:', portfolioError)
      return new Response(JSON.stringify({ error: portfolioError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (!portfolios || portfolios.length === 0) {
      console.log('No portfolios to snapshot')
      return new Response(JSON.stringify({ snapshotted: 0 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Create snapshots for each portfolio
    const snapshots = portfolios.map((portfolio) => ({
      user_id: portfolio.user_id,
      portfolio_id: portfolio.id,
      total_value: Math.random() * 50000 + 5000, // Mock value
      snapshot_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    }))

    const { error: insertError } = await supabase.from('snapshots').insert(snapshots)

    if (insertError) {
      console.error('Error creating snapshots:', insertError)
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    console.log(`Successfully created ${snapshots.length} snapshots`)

    return new Response(JSON.stringify({ snapshotted: snapshots.length }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Portfolio snapshot error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
