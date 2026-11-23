-- ============================================================
--  Secure Bank Account Management System
--  DATABASE SCHEMA & SAMPLE DATA
--  Technology: SQL (MySQL compatible)
-- ============================================================

-- Drop existing tables (if re-running)
DROP TABLE IF EXISTS AuditLog;
DROP TABLE IF EXISTS Transaction;
DROP TABLE IF EXISTS Account;
DROP TABLE IF EXISTS Customer;

-- ============================================================
-- TABLE 1: Customer
-- ============================================================
CREATE TABLE Customer (
    Customer_ID   INT           PRIMARY KEY AUTO_INCREMENT,
    Name          VARCHAR(100)  NOT NULL,
    Email         VARCHAR(150)  NOT NULL UNIQUE,
    Phone         VARCHAR(15)   NOT NULL,
    Password      VARCHAR(255)  NOT NULL,
    Role          VARCHAR(20)   DEFAULT 'customer',
    Created_At    DATETIME      DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE 2: Account
-- ============================================================
CREATE TABLE Account (
    Account_ID     INT           PRIMARY KEY AUTO_INCREMENT,
    Customer_ID    INT           NOT NULL,
    Account_Number VARCHAR(12)   NOT NULL UNIQUE,
    Account_Type   VARCHAR(20)   NOT NULL DEFAULT 'Savings',
    Balance        DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    Status         VARCHAR(20)   DEFAULT 'Active',
    Created_At     DATETIME      DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Customer_ID) REFERENCES Customer(Customer_ID)
        ON DELETE CASCADE
);

-- ============================================================
-- TABLE 3: Transaction
-- ============================================================
CREATE TABLE Transaction (
    Transaction_ID   INT           PRIMARY KEY AUTO_INCREMENT,
    Account_ID       INT           NOT NULL,
    Transaction_Type VARCHAR(20)   NOT NULL,  -- 'Deposit','Withdrawal','Transfer'
    Amount           DECIMAL(15,2) NOT NULL,
    Balance_After    DECIMAL(15,2),
    Description      VARCHAR(255),
    Date             DATETIME      DEFAULT CURRENT_TIMESTAMP,
    Status           VARCHAR(20)   DEFAULT 'Success',
    FOREIGN KEY (Account_ID) REFERENCES Account(Account_ID)
        ON DELETE CASCADE
);

-- ============================================================
-- TABLE 4: AuditLog  (Milestone 3 — Audit Logging)
-- ============================================================
CREATE TABLE AuditLog (
    Log_ID       INT           PRIMARY KEY AUTO_INCREMENT,
    Customer_ID  INT,
    Email        VARCHAR(150),
    Action       VARCHAR(100)  NOT NULL,
    Details      VARCHAR(500),
    IP_Address   VARCHAR(50)   DEFAULT 'localhost',
    Timestamp    DATETIME      DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Customer_ID) REFERENCES Customer(Customer_ID)
        ON DELETE SET NULL
);

-- ============================================================
-- SAMPLE DATA — Customers
-- ============================================================
INSERT INTO Customer (Name, Email, Phone, Password, Role) VALUES
('John Doe',    'john@bank.com',  '9876543210', 'john123',  'customer'),
('Jane Smith',  'jane@bank.com',  '8765432109', 'jane123',  'customer'),
('Ravi Kumar',  'ravi@bank.com',  '7654321098', 'ravi123',  'customer'),
('Admin User',  'admin@bank.com', '9999999999', 'admin123', 'admin');

-- ============================================================
-- SAMPLE DATA — Accounts
-- ============================================================
INSERT INTO Account (Customer_ID, Account_Number, Account_Type, Balance) VALUES
(1, 'ACC0000000001', 'Savings',  50000.00),
(2, 'ACC0000000002', 'Current',  75000.00),
(3, 'ACC0000000003', 'Savings',  30000.00);

-- ============================================================
-- SAMPLE DATA — Transactions
-- ============================================================
INSERT INTO Transaction (Account_ID, Transaction_Type, Amount, Balance_After, Description, Status) VALUES
(1, 'Deposit',    20000.00, 50000.00, 'Initial deposit',               'Success'),
(1, 'Withdrawal',  5000.00, 45000.00, 'ATM withdrawal',                'Success'),
(1, 'Transfer',   10000.00, 35000.00, 'Transfer to ACC0000000002',     'Success'),
(1, 'Deposit',    15000.00, 50000.00, 'Salary credit',                 'Success'),
(2, 'Deposit',    75000.00, 75000.00, 'Initial deposit',               'Success'),
(2, 'Deposit',    10000.00, 85000.00, 'Received transfer from ACC001', 'Success'),
(2, 'Withdrawal', 20000.00, 65000.00, 'Bill payment',                  'Success'),
(3, 'Deposit',    30000.00, 30000.00, 'Initial deposit',               'Success'),
(3, 'Withdrawal',  5000.00, 25000.00, 'Shopping',                      'Success'),
(3, 'Deposit',    10000.00, 35000.00, 'Freelance payment',             'Success');

-- ============================================================
-- SAMPLE DATA — Audit Log
-- ============================================================
INSERT INTO AuditLog (Customer_ID, Email, Action, Details) VALUES
(1, 'john@bank.com',  'LOGIN',      'User logged in successfully'),
(1, 'john@bank.com',  'MFA_VERIFY', 'OTP verified successfully'),
(1, 'john@bank.com',  'DEPOSIT',    'Deposited ₹15000'),
(2, 'jane@bank.com',  'LOGIN',      'User logged in successfully'),
(2, 'jane@bank.com',  'WITHDRAWAL', 'Withdrew ₹20000'),
(1, 'john@bank.com',  'TRANSFER',   'Transferred ₹10000 to ACC0000000002'),
(1, 'john@bank.com',  'LOGOUT',     'User logged out');

-- ============================================================
-- USEFUL QUERIES
-- ============================================================

-- View all customers
-- SELECT * FROM Customer;

-- View all accounts with customer names
-- SELECT a.Account_ID, c.Name, a.Account_Number, a.Account_Type, a.Balance
-- FROM Account a JOIN Customer c ON a.Customer_ID = c.Customer_ID;

-- View transaction history for an account
-- SELECT * FROM Transaction WHERE Account_ID = 1 ORDER BY Date DESC;

-- View audit log
-- SELECT * FROM AuditLog ORDER BY Timestamp DESC;

