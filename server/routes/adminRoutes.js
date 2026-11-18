const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.get('/users', authMiddleware, adminMiddleware, adminController.getAllUsers);
router.put('/freeze/:id', authMiddleware, adminMiddleware, adminController.freezeAccount);
router.put('/unfreeze/:id', authMiddleware, adminMiddleware, adminController.unfreezeAccount);
router.delete('/user/:id', authMiddleware, adminMiddleware, adminController.deleteUser);
router.post('/add-funds', authMiddleware, adminMiddleware, adminController.addFunds);
router.get('/transactions', authMiddleware, adminMiddleware, adminController.getAllTransactions);
router.get('/stats', authMiddleware, adminMiddleware, adminController.getTransactionStats);

module.exports = router;
