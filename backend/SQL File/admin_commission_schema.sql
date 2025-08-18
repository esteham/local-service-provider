-- Admin Commission System Schema
-- This adds admin commission tracking to the existing payment system

-- Create admin_earnings table to track platform commission
CREATE TABLE IF NOT EXISTS admin_earnings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payment_id INT NOT NULL,
    service_request_id INT NOT NULL,
    worker_id INT NOT NULL,
    user_id INT NOT NULL,
    gross_amount DECIMAL(10,2) NOT NULL, -- Total service amount
    commission_rate DECIMAL(5,2) NOT NULL DEFAULT 10.00, -- Platform commission percentage
    commission_amount DECIMAL(10,2) NOT NULL, -- Platform commission amount (10% of gross)
    worker_net_amount DECIMAL(10,2) NOT NULL, -- Amount worker receives (90% of gross)
    status ENUM('pending', 'processed', 'paid') DEFAULT 'pending',
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
    FOREIGN KEY (service_request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_payment_id (payment_id),
    INDEX idx_service_request_id (service_request_id),
    INDEX idx_worker_id (worker_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Add admin commission tracking to payments table
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS admin_commission_amount DECIMAL(10,2) DEFAULT 0.00 AFTER amount,
ADD COLUMN IF NOT EXISTS admin_commission_processed BOOLEAN DEFAULT FALSE AFTER admin_commission_amount;

-- Update system settings for commission tracking
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('admin_commission_rate', '10.00', 'Admin platform commission rate percentage'),
('admin_commission_auto_process', 'true', 'Automatically process admin commission on payment completion'),
('admin_commission_account', 'admin@platform.com', 'Admin account for commission tracking')
ON DUPLICATE KEY UPDATE 
setting_value = VALUES(setting_value),
description = VALUES(description);
