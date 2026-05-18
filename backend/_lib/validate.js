/**
 * Validation schemas and utilities
 */

/**
 * Simple validation function (Joi-like API)
 */
function validate(obj, schema) {
  const errors = []

  if (schema.fields) {
    for (const [key, rules] of Object.entries(schema.fields)) {
      const value = obj[key]

      if (rules.required && (value === undefined || value === null)) {
        errors.push({
          path: [key],
          message: `${key} is required`,
        })
        continue
      }

      if (value === undefined || value === null) {
        continue
      }

      if (rules.type === 'number' && typeof value !== 'number') {
        errors.push({
          path: [key],
          message: `${key} must be a number`,
        })
      }

      if (rules.type === 'string' && typeof value !== 'string') {
        errors.push({
          path: [key],
          message: `${key} must be a string`,
        })
      }

      if (rules.min && typeof value === 'number' && value < rules.min) {
        errors.push({
          path: [key],
          message: `${key} must be at least ${rules.min}`,
        })
      }

      if (rules.max && typeof value === 'number' && value > rules.max) {
        errors.push({
          path: [key],
          message: `${key} must be at most ${rules.max}`,
        })
      }
    }
  }

  return {
    error: errors.length > 0 ? { details: errors } : null,
    value: obj,
  }
}

/**
 * Transaction validation schema
 */
function createTransactionSchema() {
  return {
    fields: {
      amount: { required: true, type: 'number', min: 0.01 },
      portfolio_id: { required: false, type: 'string' },
      description: { required: false, type: 'string' },
    },
  }
}

// Export for both ESM and CommonJS
export { validate, createTransactionSchema }

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    validate,
    createTransactionSchema,
  }
}
