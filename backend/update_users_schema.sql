-- Update users table to support pending user approval system
-- Run this script to add pending and email_pending statuses to the users table

-- First, check current status values
SELECT DISTINCT status FROM users;

-- Update the users table to include pending statuses
ALTER TABLE users 
MODIFY COLUMN status ENUM('active', 'inactive', 'pending', 'email_pending', 'rejected') DEFAULT 'email_pending';

-- Add email verification columns if they don't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100) NULL,
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100) NULL,
ADD COLUMN IF NOT EXISTS phone VARCHAR(20) NULL;

-- Create sample pending users for testing (optional)
-- Uncomment the lines below if you want to create test pending users

/*
INSERT INTO users (username, email, password, role, status, first_name, last_name, phone, created_at) VALUES
('pending_worker1', 'worker1@test.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'worker', 'pending', 'John', 'Worker', '+8801712345001', NOW()),
('pending_worker2', 'worker2@test.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'worker', 'pending', 'Jane', 'Worker', '+8801712345002', NOW()),
('pending_agent1', 'agent1@test.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'agent', 'pending', 'Mike', 'Agent', '+8801712345003', NOW()),
('email_pending_user', 'user@test.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'email_pending', 'Sarah', 'User', '+8801712345004', NOW());

-- Create corresponding worker and agent records for the pending users
INSERT INTO workers (user_id, phone, address, skills, status, created_at) VALUES
((SELECT id FROM users WHERE username = 'pending_worker1'), '+8801712345001', 'Test Address 1', 'Electrical work, Repairs', 'pending', NOW()),
((SELECT id FROM users WHERE username = 'pending_worker2'), '+8801712345002', 'Test Address 2', 'Plumbing, Maintenance', 'pending', NOW());

INSERT INTO agents (user_id, created_at) VALUES
((SELECT id FROM users WHERE username = 'pending_agent1'), NOW());
*/

-- Verify the changes
SHOW COLUMNS FROM users LIKE 'status';
SELECT COUNT(*) as pending_users_count FROM users WHERE status IN ('pending', 'email_pending');
