const pool = require('../config/database');

class User {
  static async create(userData) {
    const { fullName, email, password, accountNumber, initialBalance = 10000 } = userData;
    const balance = initialBalance; // Initial balance (configurable, defaults to 10000)
    const role = 'user';

    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        'INSERT INTO users (full_name, email, password, account_number, balance, role) VALUES (?, ?, ?, ?, ?, ?)',
        [fullName, email, password, accountNumber, balance, role]
      );
      return result.insertId;
    } finally {
      connection.release();
    }
  }

  static async findById(id) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute('SELECT * FROM users WHERE id = ?', [id]);
      return rows[0] || null;
    } finally {
      connection.release();
    }
  }

  static async findByEmail(email) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);
      return rows[0] || null;
    } finally {
      connection.release();
    }
  }

  static async updateBalance(id, newBalance) {
    const connection = await pool.getConnection();
    try {
      await connection.execute('UPDATE users SET balance = ? WHERE id = ?', [newBalance, id]);
    } finally {
      connection.release();
    }
  }

  static async freezeAccount(id) {
    const connection = await pool.getConnection();
    try {
      await connection.execute('UPDATE users SET is_frozen = true WHERE id = ?', [id]);
    } finally {
      connection.release();
    }
  }

  static async unfreezeAccount(id) {
    const connection = await pool.getConnection();
    try {
      await connection.execute('UPDATE users SET is_frozen = false WHERE id = ?', [id]);
    } finally {
      connection.release();
    }
  }

  static async deleteUser(id) {
    const connection = await pool.getConnection();
    try {
      await connection.execute('DELETE FROM users WHERE id = ?', [id]);
    } finally {
      connection.release();
    }
  }

  static async getAllUsers() {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute('SELECT id, full_name, email, account_number, balance, role, is_frozen, created_at FROM users ORDER BY created_at DESC');
      return rows;
    } finally {
      connection.release();
    }
  }

  static async checkEmailExists(email) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute('SELECT id FROM users WHERE email = ?', [email]);
      return rows.length > 0;
    } finally {
      connection.release();
    }
  }
}

module.exports = User;
