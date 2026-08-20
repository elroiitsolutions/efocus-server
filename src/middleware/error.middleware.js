const { sendError } = require('../utils/response');
const env = require('../config/env');

/**
 * Express error handling middleware.
 */
function errorMiddleware(err, req, res, next) {
  // Log the complete error stack in development for easier debugging
  if (env.nodeEnv !== 'production') {
    console.error('--- ERROR DETAIL ---');
    console.error(err);
    console.error('--------------------');
  } else {
    console.error(`[Error] ${err.name || 'Error'}: ${err.message}`);
  }

  // Prevent multiple response headers error
  if (res.headersSent) {
    return next(err);
  }

  // 1. Handle MySQL Specific Errors
  if (err.code && typeof err.code === 'string' && err.code.startsWith('ER_')) {
    if (err.code === 'ER_DUP_ENTRY') {
      return sendError(res, 'Conflict: A record with this unique attribute already exists.', 409);
    }
    if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_NO_REFERENCED_ROW') {
      return sendError(res, 'Validation error: One or more referenced categories, subcategories, or product families do not exist.', 400);
    }
    if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_ROW_IS_REFERENCED') {
      return sendError(res, 'Constraint error: This record is referenced by other items and cannot be modified or deleted.', 400);
    }

    const dbMsg = env.nodeEnv === 'production' 
      ? 'A database error occurred.' 
      : `MySQL Error [${err.code}]: ${err.message}`;
    return sendError(res, dbMsg, 500);
  }

  // 2. Handle Custom Validation Error
  if (err.name === 'ValidationError') {
    return res.status(err.statusCode || 400).json({
      success: false,
      message: err.message || 'Validation failed',
      errors: err.errors || {}
    });
  }

  // 3. Handle Resource Not Found Custom Error
  if (err.name === 'NotFoundError') {
    return sendError(res, err.message || 'Resource not found', 404);
  }

  // 4. Default generic internal server error
  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  return sendError(res, message, status);
}

module.exports = errorMiddleware;
