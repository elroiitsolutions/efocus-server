/**
 * Factory middleware to validate the request body using a custom schema-like validation function.
 * @param {Function} validatorFn Validation logic that returns an object containing errors, or null.
 */
function validateBody(validatorFn) {
  return (req, res, next) => {
    const errors = validatorFn(req.body);
    if (errors && Object.keys(errors).length > 0) {
      const err = new Error('Validation failed');
      err.name = 'ValidationError';
      err.statusCode = 400;
      err.errors = errors;
      return next(err);
    }
    next();
  };
}

/**
 * Middleware to validate that a URL parameter is a valid positive integer ID.
 * Automatically casts the validated ID parameter to a Number.
 * @param {string} paramName Name of the parameter to check (default: 'id')
 */
function validateId(paramName = 'id') {
  return (req, res, next) => {
    const idValue = req.params[paramName];
    const id = parseInt(idValue, 10);
    
    if (isNaN(id) || id <= 0) {
      const err = new Error('Validation failed');
      err.name = 'ValidationError';
      err.statusCode = 400;
      err.errors = {
        [paramName]: `Must be a valid positive integer, received: '${idValue}'`
      };
      return next(err);
    }
    
    // Replace string value with the parsed integer value for controllers
    req.params[paramName] = id;
    next();
  };
}

module.exports = {
  validateBody,
  validateId
};
