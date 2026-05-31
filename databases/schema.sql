-- Fiadh Database Schema
-- Created: 2026-05-31
-- Student: Molly Kane | 25132539
-- Module: Software Development (HDSDEV_SEP25)

-- Drop tables in reverse order to avoid foreign key conflicts
DROP TABLE IF EXISTS articles;
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS income;
DROP TABLE IF EXISTS contracts;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS users;

-- USERS
CREATE TABLE users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100)  NOT NULL,
  email         VARCHAR(150)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  role          ENUM('user', 'admin') DEFAULT 'user',
  created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- INVOICES
CREATE TABLE invoices (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT             NOT NULL,
  client_name VARCHAR(150)    NOT NULL,
  description TEXT,
  amount      DECIMAL(10,2)   NOT NULL,
  vat_enabled BOOLEAN         DEFAULT FALSE,
  vat_amount  DECIMAL(10,2)   DEFAULT 0.00,
  total       DECIMAL(10,2)   NOT NULL,
  status      ENUM('Sent', 'Paid', 'Overdue') DEFAULT 'Sent',
  due_date    DATE,
  created_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- CONTRACTS
CREATE TABLE contracts (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  user_id             INT             NOT NULL,
  contract_type       ENUM('Commission', 'Licensing', 'Collaboration') NOT NULL,
  client_name         VARCHAR(150)    NOT NULL,
  project_description TEXT,
  payment_amount      DECIMAL(10,2),
  start_date          DATE,
  end_date            DATE,
  terms               TEXT,
  created_at          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- INCOME
CREATE TABLE income (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT           NOT NULL,
  amount     DECIMAL(10,2) NOT NULL,
  source     VARCHAR(150),
  category   VARCHAR(100),
  entry_date DATE          NOT NULL,
  notes      TEXT,
  created_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- EXPENSES
CREATE TABLE expenses (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT           NOT NULL,
  amount     DECIMAL(10,2) NOT NULL,
  category   VARCHAR(100),
  entry_date DATE          NOT NULL,
  notes      TEXT,
  created_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ARTICLES (Educational Hub)
CREATE TABLE articles (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  title        VARCHAR(255) NOT NULL,
  category     VARCHAR(100),
  body         TEXT         NOT NULL,
  author_id    INT,
  published_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
);