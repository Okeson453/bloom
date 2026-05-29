/**
 * CORS Middleware
 * Handles Cross-Origin Resource Sharing for all API endpoints
 */

export function withCors(handler) {
  return async (req, res) => {
    // Allow all origins (can be restricted to specific domains in production)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
    res.setHeader('Access-Control-Max-Age', '86400')
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end()
    }
    
    return handler(req, res)
  }
}
