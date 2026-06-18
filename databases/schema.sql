-- Fiadh Database Schema
-- Updated: 2026-06-18
-- Student: Molly Kane | 25132539
-- Module: Software Development (HDSDEV_SEP25)


-- Drop tables in reverse order to avoid foreign key conflicts
DROP TABLE IF EXISTS articles;
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS income;
DROP TABLE IF EXISTS contracts;
DROP TABLE IF EXISTS invoice_items;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS users;


-- USERS
CREATE TABLE users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  fname         VARCHAR(100)  DEFAULT NULL,
  lname         VARCHAR(100)  DEFAULT NULL,
  email         VARCHAR(150)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  role          ENUM('user', 'admin') DEFAULT 'user',
  created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- INVOICES
CREATE TABLE invoices (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  user_id        INT             NOT NULL,
  client_name    VARCHAR(150)    NOT NULL,
  client_email   VARCHAR(150)    DEFAULT NULL,
  client_address TEXT            DEFAULT NULL,
  description    TEXT,
  amount         DECIMAL(10,2)   NOT NULL DEFAULT '0.00',
  vat_enabled    TINYINT(1)      DEFAULT '0',
  vat_amount     DECIMAL(10,2)   DEFAULT '0.00',
  total          DECIMAL(10,2)   NOT NULL DEFAULT '0.00',
  status         ENUM('draft', 'sent', 'paid', 'overdue') DEFAULT 'draft',
  due_date       DATE            DEFAULT NULL,
  notes          TEXT,
  invoice_number VARCHAR(50)     DEFAULT NULL,
  is_deleted     TINYINT(1)      NOT NULL DEFAULT '0',
  created_at     TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- INVOICE ITEMS
CREATE TABLE invoice_items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  invoice_id  INT             NOT NULL,
  description TEXT,
  quantity    DECIMAL(10,2)   DEFAULT NULL,
  rate        DECIMAL(10,2)   DEFAULT NULL,
  total       DECIMAL(10,2)   DEFAULT NULL,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- CONTRACTS
CREATE TABLE contracts (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  user_id             INT             NOT NULL,
  contract_type       ENUM('Commission', 'Licensing', 'Collaboration') NOT NULL,
  client_name         VARCHAR(150)    NOT NULL,
  project_description TEXT,
  payment_amount      DECIMAL(10,2)   DEFAULT NULL,
  start_date          DATE            DEFAULT NULL,
  end_date            DATE            DEFAULT NULL,
  terms               TEXT,
  created_at          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- INCOME
CREATE TABLE income (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT           NOT NULL,
  amount     DECIMAL(10,2) NOT NULL,
  source     VARCHAR(150)  DEFAULT NULL,
  category   VARCHAR(100)  DEFAULT NULL,
  entry_date DATE          NOT NULL,
  notes      TEXT,
  created_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- EXPENSES
CREATE TABLE expenses (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT           NOT NULL,
  amount     DECIMAL(10,2) NOT NULL,
  category   VARCHAR(100)  DEFAULT NULL,
  entry_date DATE          NOT NULL,
  notes      TEXT,
  created_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- ARTICLES (Educational Hub)
CREATE TABLE articles (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  title        VARCHAR(255) NOT NULL,
  category     VARCHAR(100) DEFAULT NULL,
  body         TEXT         NOT NULL,
  author_id    INT          DEFAULT NULL,
  published_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
