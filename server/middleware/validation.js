const ApiResponse = require('../utils/responseHelper');
const { validateEmail, validatePassword, validateAmount } = require('../utils/validators');

const validateRegister = (req, res, next) => {
  const { fullName, email, password, confirmPassword } = req.body;

  if (!fullName || !email || !password || !confirmPassword) {
    return ApiResponse.error(res, 'All fields are required', 400);
  }

  if (!validateEmail(email)) {
    return ApiResponse.error(res, 'Invalid email format', 400);
  }

  if (!validatePassword(password)) {
    return ApiResponse.error(res, 'Password must be at least 8 characters with uppercase, lowercase, and number', 400);
  }

  if (password !== confirmPassword) {
    return ApiResponse.error(res, 'Passwords do not match', 400);
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return ApiResponse.error(res, 'Email and password are required', 400);
  }

  if (!validateEmail(email)) {
    return ApiResponse.error(res, 'Invalid email format', 400);
  }

  next();
};

const validateTransfer = (req, res, next) => {
  const { receiverEmail, amount } = req.body;

  if (!receiverEmail || !amount) {
    return ApiResponse.error(res, 'Receiver email and amount are required', 400);
  }

  if (!validateEmail(receiverEmail)) {
    return ApiResponse.error(res, 'Invalid email format', 400);
  }

  if (!validateAmount(amount)) {
    return ApiResponse.error(res, 'Invalid amount', 400);
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateTransfer,
};
