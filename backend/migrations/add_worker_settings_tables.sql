-- Migration: Add worker settings and related tables
-- Date: 2025-08-10

-- Create worker_settings table
CREATE TABLE IF NOT EXISTS worker_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    worker_id INT NOT NULL,
    email_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT TRUE,
    auto_accept_radius INT DEFAULT 10,
    working_hours_start TIME DEFAULT '09:00:00',
    working_hours_end TIME DEFAULT '17:00:00',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE
);

-- Create worker_services table if not exists
CREATE TABLE IF NOT EXISTS worker_services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    worker_id INT NOT NULL,
    service_id INT NOT NULL,
    price_override DECIMAL(10,2) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    UNIQUE KEY unique_worker_service (worker_id, service_id)
);

-- Add scheduled_date and scheduled_time columns to service_requests if not exists
ALTER TABLE service_requests 
ADD COLUMN IF NOT EXISTS scheduled_date DATE NULL,
ADD COLUMN IF NOT EXISTS scheduled_time TIME NULL,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP NULL;

-- Add experience_years, hourly_rate, bio, certifications to workers table if not exists
ALTER TABLE workers 
ADD COLUMN IF NOT EXISTS experience_years INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(8,2) DEFAULT 25.00,
ADD COLUMN IF NOT EXISTS bio TEXT NULL,
ADD COLUMN IF NOT EXISTS certifications TEXT NULL;

-- Insert some default worker services for existing workers
INSERT IGNORE INTO worker_services (worker_id, service_id, is_active)
SELECT w.id, s.id, TRUE
FROM workers w
CROSS JOIN services s
WHERE w.id IN (SELECT id FROM workers LIMIT 5)
AND s.id IN (SELECT id FROM services LIMIT 10);

-- Insert default settings for existing workers
INSERT IGNORE INTO worker_settings (worker_id)
SELECT id FROM workers WHERE id NOT IN (SELECT worker_id FROM worker_settings);
