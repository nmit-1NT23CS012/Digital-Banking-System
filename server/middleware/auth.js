const jwt = require('jsonwebtoken');
const ApiResponse = require('../utils/responseHelper');
const logger = require('../config/logger');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  let decoded;
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;

    if (!token) {
      logger.warn('Access attempt without token');
      return ApiResponse.error(res, 'Access token required', 401);
    }

    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    logger.warn(`Token verification failed: ${error.message}`);
    return ApiResponse.error(res, 'Invalid or expired token', 401);
  }

  try {
    const user = await User.findById(decoded.id);
    if (!user) {
      return ApiResponse.error(res, 'User not found', 401);
    }
    if (user.is_frozen) {
      return ApiResponse.error(res, 'Account is frozen', 403);
    }

    req.user = { id: user.id, email: user.email, role: user.role };
    return next();
  } catch (error) {
    return next(error);
  }
};

const adminMiddleware = (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      logger.warn(`Unauthorized admin access attempt by user ${req.user.id}`);
      return ApiResponse.error(res, 'Admin access required', 403);
    }
    next();
  } catch (error) {
    logger.error(`Admin middleware error: ${error.message}`);
    return ApiResponse.error(res, 'Authorization failed', 403);
  }
};

module.exports = { authMiddleware, adminMiddleware };
