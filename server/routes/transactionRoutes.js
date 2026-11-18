const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authMiddleware } = require('../middleware/auth');
const { validateTransfer } = require('../middleware/validation');

router.post('/transfer', authMiddleware, validateTransfer, transactionController.transfer);
router.get('/history', authMiddleware, transactionController.getTransactionHistory);
router.get('/balance', authMiddleware, transactionController.getBalance);

module.exports = router;
