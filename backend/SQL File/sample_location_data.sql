-- Sample location data for testing the location hierarchy
-- This follows the proper hierarchy: divisions → districts → upazilas → zones → areas

-- Insert sample divisions
INSERT INTO divisions (name) VALUES 
('Dhaka'),
('Chittagong'),
('Rajshahi'),
('Khulna'),
('Sylhet'),
('Barisal'),
('Rangpur'),
('Mymensingh');

-- Insert sample districts
INSERT INTO districts (division_id, name) VALUES 
-- Dhaka Division
(1, 'Dhaka'),
(1, 'Gazipur'),
(1, 'Narayanganj'),
(1, 'Tangail'),
-- Chittagong Division
(2, 'Chittagong'),
(2, 'Coxs Bazar'),
(2, 'Comilla'),
-- Rajshahi Division
(3, 'Rajshahi'),
(3, 'Bogra'),
-- Khulna Division
(4, 'Khulna'),
(4, 'Jessore');

-- Insert sample upazilas
INSERT INTO upazilas (district_id, name) VALUES 
-- Dhaka District
(1, 'Dhanmondi'),
(1, 'Gulshan'),
(1, 'Uttara'),
(1, 'Mirpur'),
-- Gazipur District
(2, 'Gazipur Sadar'),
(2, 'Sreepur'),
-- Chittagong District
(5, 'Chittagong Sadar'),
(5, 'Hathazari'),
-- Rajshahi District
(8, 'Rajshahi Sadar'),
(8, 'Paba');

-- Insert sample zones
INSERT INTO zones (upazila_id, name) VALUES 
-- Dhanmondi Upazila
(1, 'Dhanmondi Zone 1'),
(1, 'Dhanmondi Zone 2'),
-- Gulshan Upazila
(2, 'Gulshan Zone 1'),
(2, 'Gulshan Zone 2'),
-- Uttara Upazila
(3, 'Uttara Zone 1'),
(3, 'Uttara Zone 2'),
-- Mirpur Upazila
(4, 'Mirpur Zone 1'),
(4, 'Mirpur Zone 2'),
-- Gazipur Sadar
(5, 'Gazipur Central Zone'),
(5, 'Gazipur Industrial Zone');

-- Insert sample areas
INSERT INTO areas (zone_id, name) VALUES 
-- Dhanmondi Zone 1
(1, 'Dhanmondi 1/A'),
(1, 'Dhanmondi 2/A'),
(1, 'Dhanmondi 3/A'),
-- Dhanmondi Zone 2
(2, 'Dhanmondi 4/A'),
(2, 'Dhanmondi 5/A'),
-- Gulshan Zone 1
(3, 'Gulshan 1'),
(3, 'Gulshan 2'),
-- Gulshan Zone 2
(4, 'Gulshan Avenue'),
(4, 'Gulshan Circle'),
-- Uttara Zone 1
(5, 'Uttara Sector 1'),
(5, 'Uttara Sector 2'),
-- Uttara Zone 2
(6, 'Uttara Sector 3'),
(6, 'Uttara Sector 4'),
-- Mirpur Zone 1
(7, 'Mirpur 1'),
(7, 'Mirpur 2'),
-- Mirpur Zone 2
(8, 'Mirpur 10'),
(8, 'Mirpur 11'),
-- Gazipur Central Zone
(9, 'Gazipur Town'),
(9, 'Board Bazar'),
-- Gazipur Industrial Zone
(10, 'Industrial Area 1'),
(10, 'Industrial Area 2');
