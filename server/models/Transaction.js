const pool = require('../config/database');

class Transaction {
  static async create(transactionData) {
    const { senderId, receiverId, amount, type } = transactionData;
    const status = 'completed';

    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        'INSERT INTO transactions (sender_id, receiver_id, amount, transaction_type, status) VALUES (?, ?, ?, ?, ?)',
        [senderId, receiverId, amount, type, status]
      );
      return result.insertId;
    } finally {
      connection.release();
    }
  }

  static async getHistoryByUserId(userId, limit = 10, offset = 0) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM transactions WHERE sender_id = ? OR receiver_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [userId, userId, parseInt(limit), parseInt(offset)]
      );
      return rows;
    } finally {
      connection.release();
    }
  }

  static async getHistoryCount(userId) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT COUNT(*) as count FROM transactions WHERE sender_id = ? OR receiver_id = ?',
        [userId, userId]
      );
      return rows[0].count;
    } finally {
      connection.release();
    }
  }

  static async getAllTransactions(limit = 20, offset = 0) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM transactions ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [parseInt(limit), parseInt(offset)]
      );
      return rows;
    } finally {
      connection.release();
    }
  }

  static async getTransactionCount() {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute('SELECT COUNT(*) as count FROM transactions');
      return rows[0].count;
    } finally {
      connection.release();
    }
  }
}

module.exports = Transaction;
