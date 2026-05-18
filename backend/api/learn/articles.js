/**
 * GET /api/learn/articles
 * Get learning articles
 */

import supabaseUser from '../../_lib/supabaseUser.js'
import { sendOk, sendUnauthorized, sendInternalError } from '../../_lib/response.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const supabase = supabaseUser(req)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return sendUnauthorized(res, 'User not authenticated')
    }

    const { category, limit = 20 } = req.query

    // Fetch articles
    let query = supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(parseInt(limit))

    if (category) {
      query = query.eq('category', category)
    }

    const { data: articles, error: articlesError } = await query

    if (articlesError) {
      console.error('Articles fetch error:', articlesError)
      return sendInternalError(res, articlesError.message)
    }

    // Fetch user's progress on these articles
    const articleIds = articles.map(a => a.id)
    const { data: progress } = await supabase
      .from('learn_progress')
      .select('*')
      .eq('user_id', user.id)
      .in('article_id', articleIds)

    const progressMap = Object.fromEntries(
      (progress || []).map(p => [p.article_id, p])
    )

    const articlesWithProgress = articles.map(article => ({
      ...article,
      userProgress: progressMap[article.id] || null,
    }))

    return sendOk(res, { articles: articlesWithProgress })
  } catch (error) {
    console.error('Handler error:', error)
    return sendInternalError(res, error.message)
  }
}
