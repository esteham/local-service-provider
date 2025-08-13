-- Payment System Schema
-- This adds payment functionality to the existing service provider system

-- Update service_requests table to include payment status
ALTER TABLE service_requests 
ADD COLUMN IF NOT EXISTS payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending' AFTER status,
ADD COLUMN IF NOT EXISTS payment_method ENUM('online', 'cash', 'card') NULL AFTER payment_status;

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_request_id INT NOT NULL,
    user_id INT NOT NULL,
    worker_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('online', 'cash', 'card') NOT NULL,
    payment_status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
    transaction_id VARCHAR(255) NULL, -- For online payments
    gateway_response JSON NULL, -- Store payment gateway response
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    paid_at TIMESTAMP NULL,
    FOREIGN KEY (service_request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE,
    INDEX idx_service_request (service_request_id),
    INDEX idx_payment_status (payment_status),
    INDEX idx_payment_method (payment_method)
);

-- Create cash_payment_codes table for cash payment verification
CREATE TABLE IF NOT EXISTS cash_payment_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payment_id INT NOT NULL,
    service_request_id INT NOT NULL,
    worker_id INT NOT NULL,
    verification_code VARCHAR(6) NOT NULL, -- 6-digit code
    is_used BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
    FOREIGN KEY (service_request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE,
    UNIQUE KEY unique_code_payment (verification_code, payment_id),
    INDEX idx_verification_code (verification_code),
    INDEX idx_expires_at (expires_at)
);

-- Create payment_logs table for audit trail
CREATE TABLE IF NOT EXISTS payment_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payment_id INT NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'created', 'processing', 'completed', 'failed', 'cancelled'
    details JSON NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
    INDEX idx_payment_id (payment_id),
    INDEX idx_action (action)
);

-- Create worker_earnings table to track worker payments
CREATE TABLE IF NOT EXISTS worker_earnings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    worker_id INT NOT NULL,
    payment_id INT NOT NULL,
    service_request_id INT NOT NULL,
    gross_amount DECIMAL(10,2) NOT NULL, -- Total service amount
    commission_rate DECIMAL(5,2) NOT NULL DEFAULT 10.00, -- Platform commission percentage
    commission_amount DECIMAL(10,2) NOT NULL, -- Platform commission amount
    net_amount DECIMAL(10,2) NOT NULL, -- Amount worker receives
    status ENUM('pending', 'processed', 'paid') DEFAULT 'pending',
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
    FOREIGN KEY (service_request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
    INDEX idx_worker_id (worker_id),
    INDEX idx_status (status)
);

-- Update service_requests status enum to include payment-related statuses
ALTER TABLE service_requests 
MODIFY COLUMN status ENUM('pending', 'assigned', 'in_progress', 'completed', 'payment_pending', 'paid', 'cancelled') DEFAULT 'pending';

-- Sample data for testing
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('payment_commission_rate', '10.00', 'Platform commission rate percentage'),
('cash_payment_code_expiry', '24', 'Cash payment verification code expiry in hours'),
('payment_gateway_enabled', 'true', 'Enable online payment gateway'),
('payment_methods_enabled', 'online,cash', 'Comma-separated list of enabled payment methods')
ON DUPLICATE KEY UPDATE 
setting_value = VALUES(setting_value),
description = VALUES(description);
