/**
 * POST /api/onboarding/quiz
 * Submit quiz responses
 */

import supabaseUser from '../../_lib/supabaseUser.js'
import { scoreQuiz, buildRecommendationReason } from './scorer.js'
import { sendOk, sendUnauthorized, handleSupabaseError } from '../../_lib/response.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const supabase = supabaseUser(req)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return sendUnauthorized(res, 'User not authenticated')
    }

    const { responses } = req.body

    // Score the quiz
    const { score, riskProfile } = scoreQuiz(responses)
    const reason = buildRecommendationReason(responses, score)

    // Update onboarding with quiz responses
    const { data: onboarding, error } = await supabase
      .from('onboarding')
      .update({
        quiz_responses: {
          ...responses,
          score,
          riskProfile,
          reason,
        },
      })
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return handleSupabaseError(res, error)
    }

    return sendOk(res, {
      onboarding,
      assessment: {
        score,
        riskProfile,
        reason,
      },
    })
  } catch (error) {
    console.error('Error submitting quiz:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
