const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiResponse = require('../utils/responseHelper');
const logger = require('../config/logger');
const crypto = require('crypto');

const generateAccountNumber = () => {
  return crypto.randomBytes(5).toString('hex').toUpperCase().slice(0, 10);
};

exports.register = async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword } = req.body;

    // Check if user exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      logger.warn(`Registration attempt with existing email: ${email}`);
      return ApiResponse.error(res, 'Email already registered', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const accountNumber = generateAccountNumber();

    // Create user
    const userId = await User.create({
      fullName,
      email,
      password: hashedPassword,
      accountNumber,
    });

    logger.info(`New user registered: ${email} with ID: ${userId}`);

    return ApiResponse.success(
      res,
      { userId, accountNumber },
      'Registration successful',
      201
    );
  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
    return ApiResponse.error(res, 'Registration failed', 500);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      logger.warn(`Login attempt with non-existent email: ${email}`);
      return ApiResponse.error(res, 'Invalid credentials', 401);
    }

    if (user.is_frozen) {
      logger.warn(`Login attempt with frozen account: ${email}`);
      return ApiResponse.error(res, 'Account is frozen', 403);
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      logger.warn(`Invalid password attempt for: ${email}`);
      return ApiResponse.error(res, 'Invalid credentials', 401);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    logger.info(`User logged in: ${email}`);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return ApiResponse.success(
      res,
      {
        token,
        refreshToken,
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          balance: user.balance,
          accountNumber: user.account_number,
          role: user.role,
        },
      },
      'Login successful'
    );
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    return ApiResponse.error(res, 'Login failed', 500);
  }
};

exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return ApiResponse.error(res, 'Refresh token required', 400);
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return ApiResponse.error(res, 'User not found', 404);
    }
    if (user.is_frozen) {
      return ApiResponse.error(res, 'Account is frozen', 403);
    }

    const newToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    logger.info(`Token refreshed for user: ${user.email}`);

    return ApiResponse.success(res, { token: newToken }, 'Token refreshed');
  } catch (error) {
    logger.error(`Token refresh error: ${error.message}`);
    return ApiResponse.error(res, 'Token refresh failed', 401);
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return ApiResponse.error(res, 'User not found', 404);
    }

    return ApiResponse.success(res, {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      balance: Number(user.balance),
      accountNumber: user.account_number,
      role: user.role,
      isFrozen: Boolean(user.is_frozen),
      createdAt: user.created_at,
    });
  } catch (error) {
    logger.error(`Get profile error: ${error.message}`);
    return ApiResponse.error(res, 'Failed to fetch profile', 500);
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  logger.info(`User logged out: ${req.user.email}`);
  return ApiResponse.success(res, null, 'Logged out successfully');
};
