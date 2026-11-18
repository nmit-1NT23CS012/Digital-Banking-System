const assert = require('assert');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger');
const authController = require('../controllers/authController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const secret = 'test-only-secret';
process.env.JWT_SECRET = secret;
process.env.JWT_REFRESH_SECRET = secret;

const makeResponse = () => ({
  statusCode: null,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
});

const makeRequest = (token) => ({
  headers: { authorization: `Bearer ${token}` },
  cookies: {},
});

const run = async () => {
  const originalFindById = User.findById;
  const originalWarn = logger.warn;
  logger.warn = () => {};
  try {
    const token = jwt.sign({ id: 7, role: 'admin' }, secret);
    User.findById = async () => ({
      id: 7,
      email: 'test@example.invalid',
      role: 'user',
      is_frozen: false,
    });

    const request = makeRequest(token);
    const response = makeResponse();
    let nextCalled = false;
    await authMiddleware(request, response, () => {
      nextCalled = true;
    });
    assert.strictEqual(nextCalled, true);
    assert.strictEqual(request.user.role, 'user');

    const adminResponse = makeResponse();
    adminMiddleware(request, adminResponse, () => {
      throw new Error('A current non-admin role must not pass admin authorization');
    });
    assert.strictEqual(adminResponse.statusCode, 403);

    User.findById = async () => ({
      id: 7,
      email: 'test@example.invalid',
      role: 'admin',
      is_frozen: true,
    });
    const frozenResponse = makeResponse();
    await authMiddleware(makeRequest(token), frozenResponse, () => {
      throw new Error('A frozen user must not pass authentication');
    });
    assert.strictEqual(frozenResponse.statusCode, 403);

    const refreshToken = jwt.sign({ id: 7 }, secret);
    const refreshResponse = makeResponse();
    await authController.refresh({ body: { refreshToken } }, refreshResponse);
    assert.strictEqual(refreshResponse.statusCode, 403);
  } finally {
    User.findById = originalFindById;
    logger.warn = originalWarn;
    delete process.env.JWT_SECRET;
    delete process.env.JWT_REFRESH_SECRET;
  }

  console.log('Authentication middleware tests passed');
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
