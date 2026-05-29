/**
 * Standardized response handlers for API endpoints
 */

function sendOk(res, data = null, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data: data || null,
  })
}

function sendCreated(res, data = null) {
  return sendOk(res, data, 201)
}

function sendBadRequest(res, message = 'Bad Request', details = null) {
  return res.status(400).json({
    success: false,
    error: message,
    details: details || null,
  })
}

function sendUnauthorized(res, message = 'Unauthorized') {
  return res.status(401).json({
    success: false,
    error: message,
  })
}

function sendForbidden(res, message = 'Forbidden') {
  return res.status(403).json({
    success: false,
    error: message,
  })
}

function sendNotFound(res, resource = 'Resource') {
  return res.status(404).json({
    success: false,
    error: `${resource} not found`,
  })
}

function sendInternalError(res, message = 'Internal Server Error') {
  console.error('Internal error:', message)
  return res.status(500).json({
    success: false,
    error: message,
  })
}

function handleSupabaseError(res, error, defaultMessage = 'Database error') {
  console.error('Supabase error:', error)

  // Handle specific Supabase error codes
  if (error.code === 'PGRST116') {
    return sendNotFound(res, 'Resource')
  }

  if (error.message?.includes('violates check constraint')) {
    return sendBadRequest(res, 'Invalid data: ' + error.message)
  }

  return sendInternalError(res, error.message || defaultMessage)
}

// Export for both ESM and CommonJS
export {
  sendOk,
  sendCreated,
  sendBadRequest,
  sendUnauthorized,
  sendForbidden,
  sendNotFound,
  sendInternalError,
  handleSupabaseError,
}

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    sendOk,
    sendCreated,
    sendBadRequest,
    sendUnauthorized,
    sendForbidden,
    sendNotFound,
    sendInternalError,
    handleSupabaseError,
  }
}
