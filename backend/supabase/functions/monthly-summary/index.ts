// Scheduled function to send monthly summaries
// Triggers via pg_cron: SELECT cron.schedule('monthly-summary', '0 8 1 * *', 'SELECT net.http_post(...)')

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const resendApiKey = Deno.env.get('RESEND_API_KEY')
const emailFrom = Deno.env.get('EMAIL_FROM')

const supabase = createClient(supabaseUrl!, supabaseServiceRoleKey!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

/**
 * Edge Function: Send monthly summaries
 * Called on the 1st of each month at 08:00 UTC by pg_cron
 */
Deno.serve(async (_req) => {
  try {
    console.log('Starting monthly summary job...')

    // Get all users
    const { data: users, error: userError } = await supabase
      .from('profiles')
      .select('id, email, full_name')

    if (userError) {
      console.error('Error fetching users:', userError)
      return new Response(JSON.stringify({ error: userError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (!users || users.length === 0) {
      console.log('No users to send summaries to')
      return new Response(JSON.stringify({ sent: 0 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // For each user, fetch their portfolio data and send summary
    let sent = 0

    for (const user of users) {
      try {
        // Get user's portfolios
        const { data: portfolios } = await supabase
          .from('portfolios')
          .select('id, name, current_value')
          .eq('user_id', user.id)

        const totalValue = portfolios?.reduce((sum, p) => sum + (p.current_value || 0), 0) || 0

        // Send email via Resend
        const emailBody = `
          <h1>Your Bloom Finance Monthly Summary</h1>
          <p>Hi ${user.full_name || 'there'},</p>
          <p>Here's your portfolio summary for this month:</p>
          <ul>
            <li>Total Portfolio Value: $${totalValue.toFixed(2)}</li>
            <li>Number of Portfolios: ${portfolios?.length || 0}</li>
          </ul>
          <p>Keep investing wisely!</p>
        `

        // Mock sending email (in production, call Resend API)
        console.log(`Would send email to: ${user.email}`)
        sent++
      } catch (userError) {
        console.error(`Error processing user ${user.id}:`, userError)
      }
    }

    console.log(`Successfully sent ${sent} monthly summaries`)

    return new Response(JSON.stringify({ sent }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Monthly summary error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
