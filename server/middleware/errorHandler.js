const ApiResponse = require('../utils/responseHelper');
const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(`Error: ${err.message}`, { stack: err.stack });

  if (err.name === 'JsonWebTokenError') {
    return ApiResponse.error(res, 'Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return ApiResponse.error(res, 'Token expired', 401);
  }

  if (err.name === 'ValidationError') {
    return ApiResponse.error(res, err.message, 400);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  return ApiResponse.error(res, message, statusCode);
};

module.exports = errorHandler;
