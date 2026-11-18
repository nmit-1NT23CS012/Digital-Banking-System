const User = require('../models/User');
const Transaction = require('../models/Transaction');
const ApiResponse = require('../utils/responseHelper');
const logger = require('../config/logger');
const pool = require('../config/database');
const { parseAmountToCents, formatCents } = require('../utils/validators');

const MAX_TRANSFER_CENTS = 99999999;
const MAX_BALANCE_CENTS = 999999999999999;

exports.transfer = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { receiverEmail, amount } = req.body;
    const senderId = Number(req.user.id);
    const amountCents = parseAmountToCents(amount);

    if (amountCents === null || amountCents <= 0 || amountCents > MAX_TRANSFER_CENTS) {
      await connection.rollback();
      return ApiResponse.error(res, 'Invalid amount', 400);
    }

    const [receiverMatches] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [receiverEmail]
    );
    if (receiverMatches.length === 0) {
      await connection.rollback();
      return ApiResponse.error(res, 'Receiver not found', 404);
    }

    const receiverId = Number(receiverMatches[0].id);
    if (senderId === receiverId) {
      await connection.rollback();
      return ApiResponse.error(res, 'Cannot transfer to yourself', 400);
    }

    const accounts = {};
    for (const id of [senderId, receiverId].sort((a, b) => a - b)) {
      const [rows] = await connection.execute(
        'SELECT * FROM users WHERE id = ? FOR UPDATE',
        [id]
      );
      if (rows[0]) {
        accounts[id] = rows[0];
      }
    }

    const sender = accounts[senderId];
    const receiver = accounts[receiverId];
    if (!sender) {
      await connection.rollback();
      return ApiResponse.error(res, 'Sender not found', 404);
    }
    if (!receiver) {
      await connection.rollback();
      return ApiResponse.error(res, 'Receiver not found', 404);
    }

    if (sender.is_frozen) {
      await connection.rollback();
      return ApiResponse.error(res, 'Your account is frozen', 403);
    }

    const senderBalanceCents = parseAmountToCents(sender.balance);
    const receiverBalanceCents = parseAmountToCents(receiver.balance);
    if (senderBalanceCents === null || receiverBalanceCents === null) {
      throw new Error('Invalid stored account balance');
    }

    if (senderBalanceCents < amountCents) {
      await connection.rollback();
      logger.warn(`Insufficient balance attempt by user ${senderId}`);
      return ApiResponse.error(res, 'Insufficient balance', 400);
    }

    const newSenderBalanceCents = senderBalanceCents - amountCents;
    const newReceiverBalanceCents = receiverBalanceCents + amountCents;
    if (newReceiverBalanceCents > MAX_BALANCE_CENTS) {
      await connection.rollback();
      return ApiResponse.error(res, 'Recipient balance exceeds the supported limit', 400);
    }

    await connection.execute(
      'UPDATE users SET balance = ? WHERE id = ?',
      [formatCents(newSenderBalanceCents), senderId]
    );
    await connection.execute(
      'UPDATE users SET balance = ? WHERE id = ?',
      [formatCents(newReceiverBalanceCents), receiverId]
    );

    const [insertResult] = await connection.execute(
      'INSERT INTO transactions (sender_id, receiver_id, amount, transaction_type, status) VALUES (?, ?, ?, ?, ?)',
      [senderId, receiverId, formatCents(amountCents), 'transfer', 'completed']
    );

    await connection.commit();

    logger.info(`Transfer successful: ${senderId} -> ${receiverId}, Amount: ${formatCents(amountCents)}`);

    return ApiResponse.success(
      res,
      {
        transactionId: insertResult.insertId,
        senderBalance: Number(formatCents(newSenderBalanceCents)),
        receiverName: receiver.full_name,
        amount: Number(formatCents(amountCents)),
        timestamp: new Date(),
      },
      'Transfer successful',
      201
    );
  } catch (error) {
    await connection.rollback();
    logger.error(`Transfer error: ${error.message}`);
    return ApiResponse.error(res, 'Transfer failed', 500);
  } finally {
    connection.release();
  }
};

exports.getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(20, parseInt(req.query.limit) || 10);
    const offset = (page - 1) * limit;

    console.log(`Fetching history for user ${userId}, page ${page}, limit ${limit}`);

    const transactions = await Transaction.getHistoryByUserId(userId, limit, offset);
    console.log(`Retrieved ${transactions.length} transactions`);

    const totalCount = await Transaction.getHistoryCount(userId);
    console.log(`Total count: ${totalCount}`);

    // Enhance transaction data with user names
    const enhancedTransactions = await Promise.all(
      transactions.map(async (txn) => {
        try {
          const otherUserId = txn.sender_id === userId ? txn.receiver_id : txn.sender_id;
          const otherUser = await User.findById(otherUserId);
          return {
            ...txn,
            otherUserName: otherUser?.full_name || 'Unknown',
            otherUserEmail: otherUser?.email || 'Unknown',
            type: txn.sender_id === userId ? 'sent' : 'received',
            amount: Number(txn.amount),
          };
        } catch (err) {
          console.error(`Error processing transaction ${txn.id}:`, err.message);
          throw err;
        }
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
    console.error(`Get transaction history error:`, error);
    logger.error(`Get transaction history error: ${error.message}`);
    return ApiResponse.error(res, 'Failed to fetch transactions', 500);
  }
};

exports.getBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return ApiResponse.error(res, 'User not found', 404);
    }

    return ApiResponse.success(res, {
      balance: user.balance,
      accountNumber: user.account_number,
      isFrozen: user.is_frozen,
    });
  } catch (error) {
    logger.error(`Get balance error: ${error.message}`);
    return ApiResponse.error(res, 'Failed to fetch balance', 500);
  }
};
