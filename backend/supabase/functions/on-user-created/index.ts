// Follow the quickstart guide: https://supabase.com/docs/guides/functions/quickstart

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
 * Edge Function: Triggered when a new user is created
 * Creates a profile record and initializes onboarding
 */
Deno.serve(async (req) => {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const { record } = await req.json()

    if (!record || !record.id) {
      return new Response(JSON.stringify({ error: 'Invalid webhook payload' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const userId = record.id
    const userEmail = record.email

    console.log(`Creating profile for new user: ${userId}`)

    // Create user profile
    const { error: profileError } = await supabase.from('profiles').insert({
      id: userId,
      email: userEmail,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (profileError) {
      console.error('Error creating profile:', profileError)
      return new Response(JSON.stringify({ error: profileError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Create onboarding record
    const { error: onboardingError } = await supabase.from('onboarding').insert({
      user_id: userId,
      quiz_responses: {},
      completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (onboardingError) {
      console.error('Error creating onboarding record:', onboardingError)
      return new Response(JSON.stringify({ error: onboardingError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true, userId }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
