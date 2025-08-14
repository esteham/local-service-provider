-- Payment OTP System Database Schema
-- This creates the necessary tables for OTP-based payment confirmation and payment slips

-- Create payment_otps table for storing OTP codes
CREATE TABLE IF NOT EXISTS payment_otps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payment_id INT NOT NULL,
    service_request_id INT NOT NULL,
    user_id INT NOT NULL,
    worker_id INT NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    expires_at DATETIME NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    used_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
    FOREIGN KEY (service_request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE,
    INDEX idx_otp_code (otp_code),
    INDEX idx_payment_id (payment_id),
    INDEX idx_expires_at (expires_at)
);

-- Create payment_slips table for storing payment slip information
CREATE TABLE IF NOT EXISTS payment_slips (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payment_id INT NOT NULL,
    service_request_id INT NOT NULL,
    user_id INT NOT NULL,
    worker_id INT NOT NULL,
    slip_number VARCHAR(20) UNIQUE NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    service_description TEXT,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('cash', 'online') NOT NULL,
    payment_date DATETIME NOT NULL,
    worker_name VARCHAR(255) NOT NULL,
    worker_phone VARCHAR(20),
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    transaction_id VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
    FOREIGN KEY (service_request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE,
    INDEX idx_slip_number (slip_number),
    INDEX idx_payment_id (payment_id),
    INDEX idx_user_id (user_id),
    INDEX idx_worker_id (worker_id)
);

-- Update payments table to add OTP-related fields if they don't exist
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS otp_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS otp_verified_at DATETIME NULL,
ADD COLUMN IF NOT EXISTS slip_generated BOOLEAN DEFAULT FALSE;

-- Create payment_history view for workers
CREATE OR REPLACE VIEW worker_payment_history AS
SELECT 
    p.id as payment_id,
    p.amount,
    p.payment_method,
    p.payment_status,
    p.otp_verified,
    p.created_at as payment_date,
    p.updated_at as last_updated,
    sr.id as service_request_id,
    sr.title as service_title,
    s.name as service_name,
    s.description as service_description,
    CONCAT(u.first_name, ' ', u.last_name) as customer_name,
    u.email as customer_email,
    ps.slip_number,
    ps.transaction_id
FROM payments p
JOIN service_requests sr ON p.service_request_id = sr.id
LEFT JOIN services s ON sr.service_id = s.id
JOIN users u ON p.user_id = u.id
LEFT JOIN payment_slips ps ON p.id = ps.payment_id
WHERE p.worker_id IS NOT NULL;

-- Create user_payment_history view for users
CREATE OR REPLACE VIEW user_payment_history AS
SELECT 
    p.id as payment_id,
    p.amount,
    p.payment_method,
    p.payment_status,
    p.otp_verified,
    p.created_at as payment_date,
    p.updated_at as last_updated,
    sr.id as service_request_id,
    sr.title as service_title,
    s.name as service_name,
    s.description as service_description,
    CONCAT(w_user.first_name, ' ', w_user.last_name) as worker_name,
    w.phone as worker_phone,
    ps.slip_number,
    ps.transaction_id
FROM payments p
JOIN service_requests sr ON p.service_request_id = sr.id
LEFT JOIN services s ON sr.service_id = s.id
JOIN workers w ON p.worker_id = w.id
JOIN users w_user ON w.user_id = w_user.id
LEFT JOIN payment_slips ps ON p.id = ps.payment_id
WHERE p.user_id IS NOT NULL;

-- Insert sample data for testing (optional)
-- This can be removed in production
INSERT IGNORE INTO payment_otps (payment_id, service_request_id, user_id, worker_id, otp_code, expires_at) 
VALUES (1, 1, 1, 1, '123456', DATE_ADD(NOW(), INTERVAL 24 HOUR));
