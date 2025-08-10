-- Sample Data for Local Service Provider Network
-- Run this after creating the database schema

-- Insert sample divisions (Bangladesh divisions)
INSERT IGNORE INTO divisions (name) VALUES 
('Dhaka'),
('Chittagong'),
('Rajshahi'),
('Khulna'),
('Barisal'),
('Sylhet'),
('Rangpur'),
('Mymensingh');

-- Insert sample districts
INSERT IGNORE INTO districts (division_id, name) VALUES 
(1, 'Dhaka'),
(1, 'Gazipur'),
(1, 'Narayanganj'),
(2, 'Chittagong'),
(2, 'Comilla'),
(3, 'Rajshahi'),
(4, 'Khulna'),
(5, 'Barisal');

-- Insert sample upazilas
INSERT IGNORE INTO upazilas (district_id, name) VALUES 
(1, 'Dhanmondi'),
(1, 'Gulshan'),
(1, 'Uttara'),
(1, 'Mirpur'),
(2, 'Savar'),
(3, 'Narayanganj Sadar'),
(4, 'Chittagong Sadar'),
(5, 'Comilla Sadar');

-- Insert sample zones
INSERT IGNORE INTO zones (upazila_id, name) VALUES 
(1, 'Dhanmondi 1'),
(1, 'Dhanmondi 2'),
(2, 'Gulshan 1'),
(2, 'Gulshan 2'),
(3, 'Uttara Sector 1'),
(3, 'Uttara Sector 3'),
(4, 'Mirpur 1'),
(4, 'Mirpur 2'),
(5, 'Savar Cantonment'),
(6, 'Narayanganj City');

-- Insert sample areas
INSERT IGNORE INTO areas (zone_id, name) VALUES 
(1, 'Dhanmondi Residential Area'),
(1, 'Dhanmondi Commercial Area'),
(2, 'Dhanmondi Lake Area'),
(3, 'Gulshan Avenue'),
(3, 'Gulshan Circle 1'),
(4, 'Gulshan Circle 2'),
(5, 'Uttara Residential'),
(6, 'Uttara Commercial'),
(7, 'Mirpur Stadium Area'),
(8, 'Mirpur DOHS');

-- Insert sample users (customers)
INSERT IGNORE INTO users (username, email, password, role, status) VALUES 
('john_doe', 'john@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active'),
('jane_smith', 'jane@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active'),
('mike_wilson', 'mike@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active'),
('sarah_johnson', 'sarah@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active'),
('david_brown', 'david@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active');

-- Insert sample worker users
INSERT IGNORE INTO users (username, email, password, role, status) VALUES 
('electrician_alex', 'alex@workers.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'worker', 'active'),
('plumber_bob', 'bob@workers.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'worker', 'active'),
('cleaner_carol', 'carol@workers.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'worker', 'active'),
('carpenter_dan', 'dan@workers.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'worker', 'active'),
('painter_eve', 'eve@workers.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'worker', 'active');

-- Insert sample agent users
INSERT IGNORE INTO users (username, email, password, role, status) VALUES 
('agent_frank', 'frank@agents.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'agent', 'active'),
('agent_grace', 'grace@agents.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'agent', 'active');

-- Insert sample workers
INSERT IGNORE INTO workers (user_id, phone, address, skills, experience, hourly_rate, availability, status, rating, total_jobs) VALUES 
(6, '+8801712345678', 'Dhanmondi, Dhaka', 'Electrical wiring, Light installation, Fan installation', 5, 45.00, 'available', 'active', 4.8, 156),
(7, '+8801812345679', 'Gulshan, Dhaka', 'Plumbing repair, Pipe installation, Toilet repair', 8, 50.00, 'available', 'active', 4.6, 203),
(8, '+8801912345680', 'Uttara, Dhaka', 'House cleaning, Office cleaning, Deep cleaning', 3, 25.00, 'available', 'active', 4.9, 89),
(9, '+8801612345681', 'Mirpur, Dhaka', 'Furniture repair, Cabinet installation, Wood work', 6, 40.00, 'busy', 'active', 4.7, 134),
(10, '+8801512345682', 'Savar, Dhaka', 'Interior painting, Exterior painting, Wall design', 4, 35.00, 'available', 'active', 4.5, 98);

-- Insert worker services
INSERT IGNORE INTO worker_services (worker_id, service_id) VALUES 
(1, 1), (1, 2),  -- Electrician: Electrical Wiring, Light Installation
(2, 3), (2, 4),  -- Plumber: Pipe Repair, Toilet Installation
(3, 5), (3, 6),  -- Cleaner: House Cleaning, Office Cleaning
(4, 7), (4, 8),  -- Carpenter: Furniture Repair, Cabinet Installation
(5, 9), (5, 10); -- Painter: Interior Painting, Exterior Painting

-- Insert worker zones
INSERT IGNORE INTO worker_zones (worker_id, zone_id) VALUES 
(1, 1), (1, 2), (1, 3),  -- Electrician covers Dhanmondi and Gulshan
(2, 1), (2, 2), (2, 4),  -- Plumber covers Dhanmondi and Gulshan
(3, 3), (3, 4), (3, 5),  -- Cleaner covers Gulshan and Uttara
(4, 5), (4, 6), (4, 7),  -- Carpenter covers Uttara and Mirpur
(5, 1), (5, 2), (5, 7);  -- Painter covers Dhanmondi and Mirpur

-- Insert sample service requests
INSERT IGNORE INTO service_requests (user_id, service_id, worker_id, zone_id, title, description, address, urgency, status, base_price, final_price, scheduled_at, created_at) VALUES 
(2, 1, 1, 1, 'Kitchen electrical wiring', 'Need to install new electrical outlets in kitchen', 'House 45, Road 12, Dhanmondi', 'normal', 'completed', 150.00, 180.00, '2024-01-15 10:00:00', '2024-01-10 09:30:00'),
(3, 3, 2, 2, 'Bathroom pipe repair', 'Leaking pipe in master bathroom', 'Apartment 5B, Gulshan Avenue', 'urgent', 'completed', 80.00, 95.00, '2024-01-16 14:00:00', '2024-01-15 11:20:00'),
(4, 5, 3, 3, 'Office deep cleaning', 'Monthly deep cleaning for office space', 'Office 302, Uttara Commercial', 'normal', 'completed', 120.00, 120.00, '2024-01-18 09:00:00', '2024-01-16 16:45:00'),
(5, 7, 4, 5, 'Dining table repair', 'Wobbly dining table needs fixing', 'House 78, Uttara Sector 1', 'normal', 'in_progress', 60.00, 75.00, '2024-01-20 11:00:00', '2024-01-18 14:20:00'),
(2, 9, 5, 1, 'Living room painting', 'Paint living room walls', 'House 45, Road 12, Dhanmondi', 'normal', 'assigned', 200.00, 250.00, '2024-01-25 08:00:00', '2024-01-20 10:15:00'),
(3, 2, 1, 2, 'Ceiling fan installation', 'Install 3 ceiling fans', 'Apartment 5B, Gulshan Avenue', 'normal', 'pending', 90.00, 110.00, '2024-01-28 15:00:00', '2024-01-22 12:30:00'),
(4, 4, 2, 3, 'Toilet installation', 'Install new toilet in guest bathroom', 'Office 302, Uttara Commercial', 'normal', 'assigned', 120.00, 140.00, '2024-01-30 10:00:00', '2024-01-24 09:45:00');

-- Insert sample service reviews
INSERT IGNORE INTO service_reviews (service_request_id, user_id, worker_id, rating, review) VALUES 
(1, 2, 1, 5, 'Excellent work! Very professional and completed on time.'),
(2, 3, 2, 4, 'Good service, fixed the leak quickly. Slightly expensive but worth it.'),
(3, 4, 3, 5, 'Amazing cleaning service! Office looks brand new. Highly recommended.');

-- Insert sample notifications
INSERT IGNORE INTO notifications (user_id, title, message, type, is_read) VALUES 
(2, 'Service Completed', 'Your electrical wiring service has been completed successfully.', 'success', TRUE),
(3, 'Payment Reminder', 'Please complete payment for your plumbing service.', 'warning', FALSE),
(4, 'New Service Available', 'AC repair service is now available in your area.', 'info', FALSE),
(5, 'Service Scheduled', 'Your dining table repair is scheduled for tomorrow at 11 AM.', 'info', TRUE),
(6, 'Welcome!', 'Welcome to Local Service Provider Network. Complete your profile to get started.', 'info', FALSE),
(7, 'Job Assignment', 'You have been assigned a new plumbing job in Gulshan area.', 'success', TRUE),
(8, 'Profile Approved', 'Your worker profile has been approved. You can now receive job assignments.', 'success', TRUE);

-- Insert sample messages (this will create the messages table if it doesn't exist)
INSERT IGNORE INTO messages (sender_id, receiver_id, subject, message, type, priority, status) VALUES 
(2, 1, 'Service Quality Feedback', 'The electrician did an excellent job. Very satisfied with the service quality.', 'feedback', 'low', 'read'),
(3, 1, 'Billing Issue', 'I was charged extra for materials that were not used. Please review my bill.', 'complaint', 'high', 'replied'),
(4, 1, 'Service Inquiry', 'Do you provide carpet cleaning services? I need it for my office.', 'inquiry', 'medium', 'unread'),
(5, 1, 'Emergency Request', 'My water heater is leaking badly. Need immediate assistance.', 'support', 'urgent', 'read'),
(6, 1, 'Worker Availability', 'When will more electricians be available in Dhanmondi area?', 'inquiry', 'medium', 'unread');

-- Update some service requests to have completion timestamps
UPDATE service_requests SET 
    started_at = DATE_ADD(scheduled_at, INTERVAL 30 MINUTE),
    completed_at = DATE_ADD(scheduled_at, INTERVAL 3 HOUR)
WHERE status = 'completed';

-- Update some service requests to have start timestamps for in_progress status
UPDATE service_requests SET 
    started_at = DATE_ADD(scheduled_at, INTERVAL 15 MINUTE)
WHERE status = 'in_progress';

-- Insert zone pricing rules
INSERT IGNORE INTO zone_pricing_rules (zone_id, price_multiplier, description, status) VALUES 
(1, 1.2, 'Premium area - Dhanmondi 1', 'active'),
(2, 1.15, 'High demand area - Dhanmondi 2', 'active'),
(3, 1.3, 'Premium commercial area - Gulshan 1', 'active'),
(4, 1.25, 'Premium residential area - Gulshan 2', 'active'),
(5, 1.1, 'Developing area - Uttara Sector 1', 'active'),
(6, 1.05, 'Standard area - Uttara Sector 3', 'active'),
(7, 1.0, 'Standard pricing - Mirpur 1', 'active'),
(8, 1.0, 'Standard pricing - Mirpur 2', 'active');

-- Insert some historical data for analytics (past months)
INSERT IGNORE INTO service_requests (user_id, service_id, worker_id, zone_id, title, description, address, urgency, status, base_price, final_price, scheduled_at, completed_at, created_at) VALUES 
-- December 2023 data
(2, 1, 1, 1, 'Holiday lighting setup', 'Install holiday lights', 'House 45, Road 12, Dhanmondi', 'normal', 'completed', 100.00, 120.00, '2023-12-15 10:00:00', '2023-12-15 13:00:00', '2023-12-10 09:30:00'),
(3, 3, 2, 2, 'Winter pipe maintenance', 'Check and maintain pipes for winter', 'Apartment 5B, Gulshan Avenue', 'normal', 'completed', 70.00, 85.00, '2023-12-20 14:00:00', '2023-12-20 16:30:00', '2023-12-18 11:20:00'),
(4, 5, 3, 3, 'Year-end office cleaning', 'Deep cleaning before new year', 'Office 302, Uttara Commercial', 'normal', 'completed', 150.00, 150.00, '2023-12-28 09:00:00', '2023-12-28 15:00:00', '2023-12-25 16:45:00'),

-- November 2023 data
(5, 7, 4, 5, 'Furniture restoration', 'Restore old wooden furniture', 'House 78, Uttara Sector 1', 'normal', 'completed', 80.00, 95.00, '2023-11-15 11:00:00', '2023-11-15 16:00:00', '2023-11-12 14:20:00'),
(2, 9, 5, 1, 'Bedroom painting', 'Paint master bedroom', 'House 45, Road 12, Dhanmondi', 'normal', 'completed', 180.00, 220.00, '2023-11-22 08:00:00', '2023-11-22 17:00:00', '2023-11-18 10:15:00'),

-- October 2023 data
(3, 2, 1, 2, 'Outdoor lighting', 'Install garden lights', 'Apartment 5B, Gulshan Avenue', 'normal', 'completed', 110.00, 130.00, '2023-10-10 15:00:00', '2023-10-10 18:00:00', '2023-10-08 12:30:00'),
(4, 4, 2, 3, 'Bathroom renovation plumbing', 'Plumbing work for bathroom renovation', 'Office 302, Uttara Commercial', 'normal', 'completed', 200.00, 240.00, '2023-10-25 10:00:00', '2023-10-25 16:00:00', '2023-10-22 09:45:00');

COMMIT;
