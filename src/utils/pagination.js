/**
 * Parses and returns pagination parameters.
 * @param {object} query Request query object
 * @returns {object} { page, limit, offset }
 */
function getPaginationParams(query) {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 20;

  // Enforce positive values and cap limit at 100 for safety
  const sanitizedPage = Math.max(1, page);
  const sanitizedLimit = Math.max(1, Math.min(100, limit));
  const offset = (sanitizedPage - 1) * sanitizedLimit;

  return {
    page: sanitizedPage,
    limit: sanitizedLimit,
    offset
  };
}

/**
 * Formats data and pagination info into a standard response object.
 * @param {Array} data Paginated array of rows
 * @param {number} total Total row count in DB matching criteria
 * @param {number} page Current page number
 * @param {number} limit Page size limit
 * @returns {object} Standard pagination response structure
 */
function formatPaginatedResponse(data, total, page, limit) {
  const totalPages = Math.ceil(total / limit);
  return {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages
    }
  };
}

module.exports = {
  getPaginationParams,
  formatPaginatedResponse
};
