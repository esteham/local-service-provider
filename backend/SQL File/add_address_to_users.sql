-- Add address column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS address TEXT NULL;

-- Verify the change
SHOW COLUMNS FROM users LIKE 'address';