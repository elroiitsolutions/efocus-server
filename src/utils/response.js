/**
 * Formats and sends a successful JSON response.
 * @param {object} res Express response object
 * @param {any} data Response data payload
 * @param {number} statusCode HTTP status code (default: 200)
 */
function sendSuccess(res, data, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data
  });
}

/**
 * Formats and sends a standard error JSON response.
 * @param {object} res Express response object
 * @param {string} message Error message explanation
 * @param {number} statusCode HTTP status code (default: 500)
 */
function sendError(res, message = 'Internal Server Error', statusCode = 500) {
  return res.status(statusCode).json({
    success: false,
    message
  });
}

/**
 * Formats and sends a validation error response.
 * @param {object} res Express response object
 * @param {object} errors Dictionary of validation errors (field -> message)
 * @param {string} message Short error description
 * @param {number} statusCode HTTP status code (default: 400)
 */
function sendValidationError(res, errors = {}, message = 'Validation failed', statusCode = 400) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
}

module.exports = {
  sendSuccess,
  sendError,
  sendValidationError
};
