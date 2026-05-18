/**
 * GET /api/learn/article
 * Get a specific article by slug
 */

import supabaseUser from '../../_lib/supabaseUser.js'
import { sendOk, sendNotFound, handleSupabaseError } from '../../_lib/response.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { slug } = req.query

    if (!slug) {
      return res.status(400).json({ error: 'Article slug is required' })
    }

    const supabase = supabaseUser(req)

    // Fetch article
    const { data: article, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error && error.code === 'PGRST116') {
      return sendNotFound(res, 'Article not found')
    }

    if (error) {
      return handleSupabaseError(res, error)
    }

    return sendOk(res, { article })
  } catch (error) {
    console.error('Error fetching article:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
