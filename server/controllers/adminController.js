const User = require('../models/User');
const Transaction = require('../models/Transaction');
const ApiResponse = require('../utils/responseHelper');
const logger = require('../config/logger');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.getAllUsers();

    const userData = users.map((user) => ({
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      accountNumber: user.account_number,
      balance: Number(user.balance),
      role: user.role,
      isFrozen: Boolean(user.is_frozen),
      createdAt: user.created_at,
    }));

    return ApiResponse.success(res, { users: userData });
  } catch (error) {
    logger.error(`Get all users error: ${error.message}`);
    return ApiResponse.error(res, 'Failed to fetch users', 500);
  }
};

exports.freezeAccount = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return ApiResponse.error(res, 'User not found', 404);
    }

    await User.freezeAccount(id);

    logger.info(`Account frozen by admin: User ID ${id}`);

    return ApiResponse.success(res, { message: 'Account frozen' });
  } catch (error) {
    logger.error(`Freeze account error: ${error.message}`);
    return ApiResponse.error(res, 'Failed to freeze account', 500);
  }
};

exports.unfreezeAccount = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return ApiResponse.error(res, 'User not found', 404);
    }

    await User.unfreezeAccount(id);

    logger.info(`Account unfrozen by admin: User ID ${id}`);

    return ApiResponse.success(res, { message: 'Account unfrozen' });
  } catch (error) {
    logger.error(`Unfreeze account error: ${error.message}`);
    return ApiResponse.error(res, 'Failed to unfreeze account', 500);
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return ApiResponse.error(res, 'User not found', 404);
    }

    if (user.id === req.user.id) {
      return ApiResponse.error(res, 'Cannot delete your own account', 400);
    }

    await User.deleteUser(id);

    logger.info(`User deleted by admin: User ID ${id}`);

    return ApiResponse.success(res, { message: 'User deleted successfully' });
  } catch (error) {
    logger.error(`Delete user error: ${error.message}`);
    return ApiResponse.error(res, 'Failed to delete user', 500);
  }
};

exports.addFunds = async (req, res) => {
  try {
    const { userId, amount } = req.body;

    if (!userId || amount <= 0) {
      return ApiResponse.error(res, 'Invalid userId or amount', 400);
    }

    const user = await User.findById(userId);
    if (!user) {
      return ApiResponse.error(res, 'User not found', 404);
    }

    const newBalance = Number(user.balance) + Number(amount);
    await User.updateBalance(userId, newBalance);

    logger.info(`Funds added by admin: User ID ${userId}, Amount: ${amount}`);

    return ApiResponse.success(res, { newBalance, message: `${amount} added to account` });
  } catch (error) {
    logger.error(`Add funds error: ${error.message}`);
    return ApiResponse.error(res, 'Failed to add funds', 500);
  }
};

exports.getTransactionStats = async (req, res) => {
  try {
    const allTransactions = await Transaction.getAllTransactions(1000, 0);

    const totalTransferred = allTransactions.reduce((sum, txn) => sum + Number(txn.amount), 0);
    const stats = {
      totalTransactions: allTransactions.length,
      totalTransferred,
      averageTransactionAmount:
        allTransactions.length > 0
          ? Number(totalTransferred / allTransactions.length).toFixed(2)
          : 0,
    };

    return ApiResponse.success(res, stats);
  } catch (error) {
    logger.error(`Get transaction stats error: ${error.message}`);
    return ApiResponse.error(res, 'Failed to fetch statistics', 500);
  }
};

exports.getAllTransactions = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(20, parseInt(req.query.limit) || 10);
    const offset = (page - 1) * limit;

    const transactions = await Transaction.getAllTransactions(limit, offset);
    const totalCount = await Transaction.getTransactionCount();

    // Enhance transaction data with user names
    const enhancedTransactions = await Promise.all(
      transactions.map(async (txn) => {
        const sender = await User.findById(txn.sender_id);
        const receiver = await User.findById(txn.receiver_id);
        return {
          ...txn,
          senderName: sender?.full_name || 'Unknown',
          senderEmail: sender?.email || 'Unknown',
          receiverName: receiver?.full_name || 'Unknown',
          receiverEmail: receiver?.email || 'Unknown',
          amount: Number(txn.amount),
        };
      })
    );

    return ApiResponse.success(res, {
      transactions: enhancedTransactions,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    logger.error(`Get all transactions error: ${error.message}`);
    return ApiResponse.error(res, 'Failed to fetch transactions', 500);
  }
};
