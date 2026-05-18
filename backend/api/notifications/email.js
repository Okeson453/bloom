/**
 * POST /api/notifications/email
 * Send email notifications
 */

import { getSupabaseAdmin } from '../../_lib/supabase.js'
import { sendOk } from '../../_lib/response.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { to, subject, template, data } = req.body

    if (!to || !subject) {
      return res.status(400).json({ error: 'to and subject are required' })
    }

    // Mock email sending - in production, use Resend SDK
    console.log(`📧 Would send email to: ${to}`)
    console.log(`   Subject: ${subject}`)
    console.log(`   Template: ${template}`)

    // In production, call Resend API:
    // const { Resend } = require('resend')
    // const resend = new Resend(process.env.RESEND_API_KEY)
    // await resend.emails.send({ from: EMAIL_FROM, to, subject, html: ... })

    return sendOk(res, { message: 'Email queued for sending' })
  } catch (error) {
    console.error('Error sending email:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
