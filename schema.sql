-- Banking System Database Schema
-- Create the database
CREATE DATABASE IF NOT EXISTS banking_system;
USE banking_system;
-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    account_number VARCHAR(10) UNIQUE NOT NULL,
    balance DECIMAL(15, 2) NOT NULL DEFAULT 10000.00,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    is_frozen BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_account_number (account_number),
    INDEX idx_created_at (created_at)
);
-- Transactions table
CREATE TABLE transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL DEFAULT 'transfer',
    status VARCHAR(20) NOT NULL DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_sender_id (sender_id),
    INDEX idx_receiver_id (receiver_id),
    INDEX idx_created_at (created_at),
    INDEX idx_status (status)
);
-- No seeded user accounts or demo transactions are included.
-- Register new users through the frontend or API to populate the database.
-- Create indexes for better performance
CREATE INDEX idx_user_role ON users(role);
CREATE INDEX idx_transaction_type ON transactions(transaction_type);
CREATE INDEX idx_user_frozen ON users(is_frozen);