-- Sample data for categories and services tables
-- Run this after creating the database schema

-- Insert sample categories
INSERT INTO categories (name, description, icon, status) VALUES
('Plumbing', 'Professional plumbing services for homes and businesses', 'fas fa-wrench', 'active'),
('Electrical', 'Safe and reliable electrical work by certified professionals', 'fas fa-bolt', 'active'),
('HVAC', 'Heating, ventilation and air conditioning solutions', 'fas fa-fire', 'active'),
('Cleaning', 'Professional cleaning services for residential and commercial', 'fas fa-broom', 'active'),
('Handyman', 'General maintenance and repair services', 'fas fa-hammer', 'active'),
('Landscaping', 'Garden and outdoor maintenance services', 'fas fa-leaf', 'active'),
('Painting', 'Interior and exterior painting services', 'fas fa-paint-brush', 'active'),
('Carpentry', 'Custom woodwork and furniture services', 'fas fa-saw', 'active');

-- Insert sample services for Plumbing category (assuming category id = 1)
INSERT INTO services (category_id, name, description, base_price, unit, status) VALUES
(1, 'Emergency Plumbing Repair', '24/7 emergency plumbing services for urgent repairs', 120.00, 'hour', 'active'),
(1, 'Pipe Installation', 'Professional pipe installation and replacement services', 85.00, 'hour', 'active'),
(1, 'Drain Cleaning', 'Complete drain cleaning and unclogging services', 95.00, 'job', 'active'),
(1, 'Water Heater Installation', 'Water heater installation and maintenance', 250.00, 'job', 'active'),
(1, 'Bathroom Plumbing', 'Complete bathroom plumbing installation and repair', 150.00, 'project', 'active'),

-- Insert sample services for Electrical category (assuming category id = 2)
(2, 'Electrical Panel Upgrade', 'Upgrade your electrical panel for safety and capacity', 800.00, 'project', 'active'),
(2, 'Lighting Installation', 'Professional lighting fixture installation', 75.00, 'hour', 'active'),
(2, 'Outlet Installation', 'Install new electrical outlets and switches', 65.00, 'hour', 'active'),
(2, 'Wiring Services', 'Complete home and office wiring services', 90.00, 'hour', 'active'),
(2, 'Generator Installation', 'Backup generator installation and maintenance', 1200.00, 'project', 'active'),

-- Insert sample services for HVAC category (assuming category id = 3)
(3, 'AC Installation', 'Professional air conditioning system installation', 2500.00, 'project', 'active'),
(3, 'Furnace Repair', 'Heating system repair and maintenance', 120.00, 'hour', 'active'),
(3, 'Duct Cleaning', 'Professional air duct cleaning services', 300.00, 'job', 'active'),
(3, 'Thermostat Installation', 'Smart thermostat installation and setup', 150.00, 'job', 'active'),
(3, 'HVAC Maintenance', 'Regular HVAC system maintenance and inspection', 180.00, 'visit', 'active'),

-- Insert sample services for Cleaning category (assuming category id = 4)
(4, 'House Cleaning', 'Complete residential cleaning services', 25.00, 'hour', 'active'),
(4, 'Deep Cleaning', 'Thorough deep cleaning for homes and offices', 35.00, 'hour', 'active'),
(4, 'Carpet Cleaning', 'Professional carpet and upholstery cleaning', 45.00, 'hour', 'active'),
(4, 'Window Cleaning', 'Interior and exterior window cleaning', 30.00, 'hour', 'active'),
(4, 'Move-in/Move-out Cleaning', 'Specialized cleaning for moving situations', 200.00, 'job', 'active'),

-- Insert sample services for Handyman category (assuming category id = 5)
(5, 'General Repairs', 'Various home repair and maintenance tasks', 55.00, 'hour', 'active'),
(5, 'Furniture Assembly', 'Professional furniture assembly services', 40.00, 'hour', 'active'),
(5, 'Drywall Repair', 'Drywall patching and repair services', 60.00, 'hour', 'active'),
(5, 'Door Installation', 'Interior and exterior door installation', 180.00, 'job', 'active'),
(5, 'Shelving Installation', 'Custom shelving and storage solutions', 70.00, 'hour', 'active'),

-- Insert sample services for Landscaping category (assuming category id = 6)
(6, 'Lawn Mowing', 'Regular lawn maintenance and mowing services', 35.00, 'visit', 'active'),
(6, 'Garden Design', 'Custom garden design and landscaping', 80.00, 'hour', 'active'),
(6, 'Tree Trimming', 'Professional tree pruning and trimming', 120.00, 'job', 'active'),
(6, 'Irrigation Installation', 'Sprinkler system installation and repair', 200.00, 'project', 'active'),
(6, 'Seasonal Cleanup', 'Spring and fall yard cleanup services', 150.00, 'job', 'active'),

-- Insert sample services for Painting category (assuming category id = 7)
(7, 'Interior Painting', 'Professional interior painting services', 45.00, 'hour', 'active'),
(7, 'Exterior Painting', 'Exterior house painting and staining', 50.00, 'hour', 'active'),
(7, 'Cabinet Painting', 'Kitchen and bathroom cabinet refinishing', 60.00, 'hour', 'active'),
(7, 'Pressure Washing', 'Exterior cleaning before painting', 40.00, 'hour', 'active'),
(7, 'Color Consultation', 'Professional color selection consultation', 100.00, 'visit', 'active'),

-- Insert sample services for Carpentry category (assuming category id = 8)
(8, 'Custom Cabinets', 'Custom kitchen and bathroom cabinet installation', 120.00, 'hour', 'active'),
(8, 'Deck Construction', 'Outdoor deck building and repair', 85.00, 'hour', 'active'),
(8, 'Trim Work', 'Interior trim and molding installation', 65.00, 'hour', 'active'),
(8, 'Flooring Installation', 'Hardwood and laminate flooring installation', 75.00, 'hour', 'active'),
(8, 'Custom Furniture', 'Bespoke furniture design and construction', 100.00, 'hour', 'active');
