/**
 * Catch-all middleware for 404 resource not found errors.
 */
function notFoundMiddleware(req, res, next) {
  const error = new Error(`Endpoint not found: ${req.method} ${req.originalUrl}`);
  error.name = 'NotFoundError';
  error.statusCode = 404;
  next(error);
}

module.exports = notFoundMiddleware;
