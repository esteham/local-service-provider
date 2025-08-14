-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 05, 2025 at 06:35 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `service_provider`
--

-- --------------------------------------------------------

--
-- Table structure for table `agents`
--

CREATE TABLE `agents` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `join_date` date DEFAULT NULL,
  `zone_id` int(11) DEFAULT NULL,
  `area_id` int(11) DEFAULT NULL,
  `status` enum('pending','active','inactive') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `agents`
--

INSERT INTO `agents` (`id`, `user_id`, `phone`, `first_name`, `last_name`, `address`, `join_date`, `zone_id`, `area_id`, `status`, `created_at`, `updated_at`) VALUES
(3, 29, '01723581023', 'Esteham', 'Hasan', 'Dhaka1204', '2025-08-05', 9, 19, 'pending', '2025-08-05 11:49:39', '2025-08-05 11:49:39');

-- --------------------------------------------------------

--
-- Table structure for table `areas`
--

CREATE TABLE `areas` (
  `id` int(11) NOT NULL,
  `zone_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `areas`
--

INSERT INTO `areas` (`id`, `zone_id`, `name`, `created_at`) VALUES
(1, 1, 'Dhanmondi 1/A', '2025-08-04 15:12:27'),
(2, 1, 'Dhanmondi 2/A', '2025-08-04 15:12:27'),
(3, 1, 'Dhanmondi 3/A', '2025-08-04 15:12:27'),
(4, 2, 'Dhanmondi 4/A', '2025-08-04 15:12:27'),
(5, 2, 'Dhanmondi 5/A', '2025-08-04 15:12:27'),
(6, 3, 'Gulshan 1', '2025-08-04 15:12:27'),
(7, 3, 'Gulshan 2', '2025-08-04 15:12:27'),
(8, 4, 'Gulshan Avenue', '2025-08-04 15:12:27'),
(9, 4, 'Gulshan Circle', '2025-08-04 15:12:27'),
(10, 5, 'Uttara Sector 1', '2025-08-04 15:12:27'),
(11, 5, 'Uttara Sector 2', '2025-08-04 15:12:27'),
(12, 6, 'Uttara Sector 3', '2025-08-04 15:12:27'),
(13, 6, 'Uttara Sector 4', '2025-08-04 15:12:27'),
(14, 7, 'Mirpur 1', '2025-08-04 15:12:27'),
(15, 7, 'Mirpur 2', '2025-08-04 15:12:27'),
(16, 8, 'Mirpur 10', '2025-08-04 15:12:27'),
(17, 8, 'Mirpur 11', '2025-08-04 15:12:27'),
(18, 9, 'Gazipur Town', '2025-08-04 15:12:27'),
(19, 9, 'Board Bazar', '2025-08-04 15:12:27'),
(20, 10, 'Industrial Area 1', '2025-08-04 15:12:27'),
(21, 10, 'Industrial Area 2', '2025-08-04 15:12:27');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `description`, `icon`, `status`, `created_at`) VALUES
(1, 'Electrical', 'Electrical repair and installation services', 'fas fa-bolt', 'active', '2025-08-02 17:54:23'),
(2, 'Plumbing', 'Plumbing repair and installation services', 'fas fa-wrench', 'active', '2025-08-02 17:54:23'),
(3, 'Cleaning', 'Home and office cleaning services', 'fas fa-broom', 'active', '2025-08-02 17:54:23'),
(4, 'Carpentry', 'Wood work and furniture repair services', 'fas fa-hammer', 'active', '2025-08-02 17:54:23'),
(5, 'Painting', 'Interior and exterior painting services', 'fas fa-paint-roller', 'active', '2025-08-02 17:54:23'),
(6, 'Appliance Repair', 'Home appliance repair services', 'fas fa-tools', 'active', '2025-08-02 17:54:23');

-- --------------------------------------------------------

--
-- Table structure for table `districts`
--

CREATE TABLE `districts` (
  `id` int(11) NOT NULL,
  `division_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `districts`
--

INSERT INTO `districts` (`id`, `division_id`, `name`, `created_at`) VALUES
(1, 1, 'Dhaka', '2025-08-04 15:12:27'),
(2, 1, 'Gazipur', '2025-08-04 15:12:27'),
(3, 1, 'Narayanganj', '2025-08-04 15:12:27'),
(4, 1, 'Tangail', '2025-08-04 15:12:27'),
(5, 2, 'Chittagong', '2025-08-04 15:12:27'),
(6, 2, 'Coxs Bazar', '2025-08-04 15:12:27'),
(7, 2, 'Comilla', '2025-08-04 15:12:27'),
(8, 3, 'Rajshahi', '2025-08-04 15:12:27'),
(9, 3, 'Bogra', '2025-08-04 15:12:27'),
(10, 4, 'Khulna', '2025-08-04 15:12:27'),
(11, 4, 'Jessore', '2025-08-04 15:12:27'),
(12, 1, 'Test District', '2025-08-04 15:16:44'),
(13, 1, 'Dhaka District', '2025-08-04 15:19:41'),
(14, 1, 'Gazipur District', '2025-08-04 15:19:41'),
(15, 2, 'Chittagong District', '2025-08-04 15:19:41');

-- --------------------------------------------------------

--
-- Table structure for table `divisions`
--

CREATE TABLE `divisions` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `divisions`
--

INSERT INTO `divisions` (`id`, `name`, `created_at`) VALUES
(1, 'Dhaka', '2025-08-04 15:12:27'),
(2, 'Chittagong', '2025-08-04 15:12:27'),
(3, 'Rajshahi', '2025-08-04 15:12:27'),
(4, 'Khulna', '2025-08-04 15:12:27'),
(5, 'Sylhet', '2025-08-04 15:12:27'),
(6, 'Barisal', '2025-08-04 15:12:27'),
(7, 'Rangpur', '2025-08-04 15:12:27'),
(8, 'Mymensingh', '2025-08-04 15:12:27');

-- --------------------------------------------------------

--
-- Table structure for table `documents`
--

CREATE TABLE `documents` (
  `id` int(11) NOT NULL,
  `worker_id` int(11) NOT NULL,
  `doc_type` varchar(100) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('active','inactive') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `email_logs`
--

CREATE TABLE `email_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `email_type` enum('otp_verification','welcome','password_reset') NOT NULL,
  `subject` varchar(255) NOT NULL,
  `status` enum('sent','failed','pending') DEFAULT 'pending',
  `sent_at` timestamp NULL DEFAULT NULL,
  `error_message` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `email_logs`
--

INSERT INTO `email_logs` (`id`, `user_id`, `email`, `email_type`, `subject`, `status`, `sent_at`, `error_message`, `created_at`) VALUES
(2, 28, 'eshasan1287005@gmail.com', 'otp_verification', 'Email Verification - OTP Code', 'sent', '2025-08-05 01:55:57', NULL, '2025-08-05 05:55:48'),
(3, 29, 'estahamulhasan@gmail.com', 'otp_verification', 'Email Verification - OTP Code', 'sent', '2025-08-05 07:49:39', NULL, '2025-08-05 11:49:33'),
(4, 30, 'xet.windsurf@gmail.com', 'otp_verification', 'Email Verification - OTP Code', 'sent', '2025-08-05 08:59:13', NULL, '2025-08-05 12:59:07');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `type` enum('info','success','warning','error') DEFAULT 'info',
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `otp_verifications`
--

CREATE TABLE `otp_verifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `otp_code` varchar(6) NOT NULL,
  `otp_type` enum('registration','password_reset') DEFAULT 'registration',
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_used` tinyint(1) DEFAULT 0,
  `attempts` int(11) DEFAULT 0,
  `max_attempts` int(11) DEFAULT 3,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `otp_verifications`
--

INSERT INTO `otp_verifications` (`id`, `user_id`, `email`, `otp_code`, `otp_type`, `expires_at`, `is_used`, `attempts`, `max_attempts`, `created_at`, `updated_at`) VALUES
(2, 28, 'eshasan1287005@gmail.com', '100102', 'registration', '2025-08-05 05:56:25', 1, 1, 3, '2025-08-05 05:55:48', '2025-08-05 05:56:25'),
(3, 29, 'estahamulhasan@gmail.com', '888584', 'registration', '2025-08-05 11:50:01', 1, 1, 3, '2025-08-05 11:49:33', '2025-08-05 11:50:01'),
(4, 30, 'xet.windsurf@gmail.com', '955494', 'registration', '2025-08-05 12:59:45', 1, 1, 3, '2025-08-05 12:59:07', '2025-08-05 12:59:45');

-- --------------------------------------------------------

--
-- Table structure for table `pricing_rules`
--

CREATE TABLE `pricing_rules` (
  `id` int(11) NOT NULL,
  `zone_id` int(11) NOT NULL,
  `time_start` time NOT NULL,
  `time_end` time NOT NULL,
  `multiplier` decimal(3,2) DEFAULT NULL CHECK (`multiplier` >= 0),
  `description` text DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `service_request_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `worker_id` int(11) NOT NULL,
  `rating` int(11) NOT NULL CHECK (`rating` between 1 and 5),
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

CREATE TABLE `services` (
  `id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `base_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `unit` varchar(50) DEFAULT 'hour',
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `services`
--

INSERT INTO `services` (`id`, `category_id`, `name`, `description`, `base_price`, `unit`, `status`, `created_at`) VALUES
(1, 1, 'Electrical Wiring', 'Complete electrical wiring for homes and offices', 50.00, 'hour', 'active', '2025-08-02 17:54:23'),
(2, 1, 'Light Installation', 'Installation of lights and fixtures', 25.00, 'piece', 'active', '2025-08-02 17:54:23'),
(3, 2, 'Pipe Repair', 'Repair of leaking or broken pipes', 40.00, 'hour', 'active', '2025-08-02 17:54:23'),
(4, 2, 'Toilet Installation', 'Installation of new toilets', 80.00, 'piece', 'active', '2025-08-02 17:54:23'),
(5, 3, 'House Cleaning', 'Complete house cleaning service', 30.00, 'hour', 'active', '2025-08-02 17:54:23'),
(6, 3, 'Office Cleaning', 'Professional office cleaning', 35.00, 'hour', 'active', '2025-08-02 17:54:23'),
(7, 4, 'Furniture Repair', 'Repair of wooden furniture', 45.00, 'hour', 'active', '2025-08-02 17:54:23'),
(8, 4, 'Cabinet Installation', 'Installation of kitchen cabinets', 60.00, 'hour', 'active', '2025-08-02 17:54:23'),
(9, 5, 'Interior Painting', 'Interior wall painting', 25.00, 'sqft', 'active', '2025-08-02 17:54:23'),
(10, 5, 'Exterior Painting', 'Exterior wall painting', 30.00, 'sqft', 'active', '2025-08-02 17:54:23'),
(11, 6, 'AC Repair', 'Air conditioner repair and maintenance', 55.00, 'hour', 'active', '2025-08-02 17:54:23'),
(12, 6, 'Refrigerator Repair', 'Refrigerator repair service', 50.00, 'hour', 'active', '2025-08-02 17:54:23'),
(53, 1, 'Emergency Plumbing Repair', '24/7 emergency plumbing services for urgent repairs', 120.00, 'hour', 'active', '2025-08-03 16:19:57'),
(54, 1, 'Pipe Installation', 'Professional pipe installation and replacement services', 85.00, 'hour', 'active', '2025-08-03 16:19:57'),
(55, 1, 'Drain Cleaning', 'Complete drain cleaning and unclogging services', 95.00, 'job', 'active', '2025-08-03 16:19:57'),
(56, 1, 'Water Heater Installation', 'Water heater installation and maintenance', 250.00, 'job', 'active', '2025-08-03 16:19:57'),
(57, 1, 'Bathroom Plumbing', 'Complete bathroom plumbing installation and repair', 150.00, 'project', 'active', '2025-08-03 16:19:57'),
(58, 2, 'Electrical Panel Upgrade', 'Upgrade your electrical panel for safety and capacity', 800.00, 'project', 'active', '2025-08-03 16:19:57'),
(59, 2, 'Lighting Installation', 'Professional lighting fixture installation', 75.00, 'hour', 'active', '2025-08-03 16:19:57'),
(60, 2, 'Outlet Installation', 'Install new electrical outlets and switches', 65.00, 'hour', 'active', '2025-08-03 16:19:57'),
(61, 2, 'Wiring Services', 'Complete home and office wiring services', 90.00, 'hour', 'active', '2025-08-03 16:19:57'),
(62, 2, 'Generator Installation', 'Backup generator installation and maintenance', 1200.00, 'project', 'active', '2025-08-03 16:19:57'),
(63, 3, 'AC Installation', 'Professional air conditioning system installation', 2500.00, 'project', 'active', '2025-08-03 16:19:57'),
(64, 3, 'Furnace Repair', 'Heating system repair and maintenance', 120.00, 'hour', 'active', '2025-08-03 16:19:57'),
(65, 3, 'Duct Cleaning', 'Professional air duct cleaning services', 300.00, 'job', 'active', '2025-08-03 16:19:57'),
(66, 3, 'Thermostat Installation', 'Smart thermostat installation and setup', 150.00, 'job', 'active', '2025-08-03 16:19:57'),
(67, 3, 'HVAC Maintenance', 'Regular HVAC system maintenance and inspection', 180.00, 'visit', 'active', '2025-08-03 16:19:57'),
(68, 4, 'House Cleaning', 'Complete residential cleaning services', 25.00, 'hour', 'active', '2025-08-03 16:19:57'),
(69, 4, 'Deep Cleaning', 'Thorough deep cleaning for homes and offices', 35.00, 'hour', 'active', '2025-08-03 16:19:57'),
(70, 4, 'Carpet Cleaning', 'Professional carpet and upholstery cleaning', 45.00, 'hour', 'active', '2025-08-03 16:19:57'),
(71, 4, 'Window Cleaning', 'Interior and exterior window cleaning', 30.00, 'hour', 'active', '2025-08-03 16:19:57'),
(72, 4, 'Move-in/Move-out Cleaning', 'Specialized cleaning for moving situations', 200.00, 'job', 'active', '2025-08-03 16:19:57'),
(73, 5, 'General Repairs', 'Various home repair and maintenance tasks', 55.00, 'hour', 'active', '2025-08-03 16:19:57'),
(74, 5, 'Furniture Assembly', 'Professional furniture assembly services', 40.00, 'hour', 'active', '2025-08-03 16:19:57'),
(75, 5, 'Drywall Repair', 'Drywall patching and repair services', 60.00, 'hour', 'active', '2025-08-03 16:19:57'),
(76, 5, 'Door Installation', 'Interior and exterior door installation', 180.00, 'job', 'active', '2025-08-03 16:19:57'),
(77, 5, 'Shelving Installation', 'Custom shelving and storage solutions', 70.00, 'hour', 'active', '2025-08-03 16:19:57'),
(78, 6, 'Lawn Mowing', 'Regular lawn maintenance and mowing services', 35.00, 'visit', 'active', '2025-08-03 16:19:57'),
(79, 6, 'Garden Design', 'Custom garden design and landscaping', 80.00, 'hour', 'active', '2025-08-03 16:19:57'),
(80, 6, 'Tree Trimming', 'Professional tree pruning and trimming', 120.00, 'job', 'active', '2025-08-03 16:19:57'),
(81, 6, 'Irrigation Installation', 'Sprinkler system installation and repair', 200.00, 'project', 'active', '2025-08-03 16:19:57'),
(82, 6, 'Seasonal Cleanup', 'Spring and fall yard cleanup services', 150.00, 'job', 'active', '2025-08-03 16:19:57');

-- --------------------------------------------------------

--
-- Table structure for table `service_requests`
--

CREATE TABLE `service_requests` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `worker_id` int(11) DEFAULT NULL,
  `area_id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text NOT NULL,
  `address` text NOT NULL,
  `service_type` varchar(100) NOT NULL,
  `urgency` enum('normal','urgent','emergency') DEFAULT 'normal',
  `status` enum('pending','assigned','in_progress','completed','cancelled') DEFAULT 'pending',
  `base_price` decimal(10,2) NOT NULL CHECK (`base_price` >= 0),
  `final_price` decimal(10,2) NOT NULL CHECK (`final_price` >= 0),
  `price_breakdown` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`price_breakdown`)),
  `scheduled_at` timestamp NULL DEFAULT NULL,
  `started_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `cancellation_reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE `system_settings` (
  `id` int(11) NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text NOT NULL,
  `description` text DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `system_settings`
--

INSERT INTO `system_settings` (`id`, `setting_key`, `setting_value`, `description`, `updated_at`) VALUES
(1, 'site_name', 'Local Service Provider Network', 'Name of the application', '2025-08-02 17:54:23'),
(2, 'site_email', 'info@localservice.com', 'Contact email for the site', '2025-08-02 17:54:23'),
(3, 'default_currency', 'BDT', 'Default currency for pricing', '2025-08-02 17:54:23'),
(4, 'max_service_radius', '50', 'Maximum service radius in kilometers', '2025-08-02 17:54:23'),
(5, 'commission_rate', '10', 'Commission rate percentage for completed services', '2025-08-02 17:54:23');

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `id` int(11) NOT NULL,
  `agent_id` int(11) NOT NULL,
  `worker_id` int(11) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` enum('assigned','in_progress','completed') DEFAULT 'assigned',
  `due_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `task_assignments`
--

CREATE TABLE `task_assignments` (
  `id` int(11) NOT NULL,
  `task_id` int(11) NOT NULL,
  `worker_id` int(11) NOT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `upazilas`
--

CREATE TABLE `upazilas` (
  `id` int(11) NOT NULL,
  `district_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `upazilas`
--

INSERT INTO `upazilas` (`id`, `district_id`, `name`, `created_at`) VALUES
(1, 1, 'Dhanmondi', '2025-08-04 15:12:27'),
(2, 1, 'Gulshan', '2025-08-04 15:12:27'),
(3, 1, 'Uttara', '2025-08-04 15:12:27'),
(4, 1, 'Mirpur', '2025-08-04 15:12:27'),
(5, 2, 'Gazipur Sadar', '2025-08-04 15:12:27'),
(6, 2, 'Sreepur', '2025-08-04 15:12:27'),
(7, 5, 'Chittagong Sadar', '2025-08-04 15:12:27'),
(8, 5, 'Hathazari', '2025-08-04 15:12:27'),
(9, 8, 'Rajshahi Sadar', '2025-08-04 15:12:27'),
(10, 8, 'Paba', '2025-08-04 15:12:27'),
(11, 1, 'Test Upazila', '2025-08-04 15:16:44'),
(12, 1, 'Dhanmondi Upazila', '2025-08-04 15:19:41'),
(13, 1, 'Gulshan Upazila', '2025-08-04 15:19:41'),
(14, 2, 'Savar Upazila', '2025-08-04 15:19:41');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','agent','worker','user') NOT NULL DEFAULT 'user',
  `status` enum('active','inactive','pending','email_pending','rejected') DEFAULT 'email_pending',
  `image` varchar(200) DEFAULT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expiry` timestamp NULL DEFAULT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `email_verified` tinyint(1) DEFAULT 0,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `role`, `status`, `image`, `reset_token`, `reset_token_expiry`, `last_login`, `created_at`, `updated_at`, `email_verified`, `email_verified_at`, `first_name`, `last_name`, `phone`) VALUES
(1, 'admin', NULL, '$2y$10$onwZeu03h9HcSY7fnNKYN./hS76D1zswa/TIUNqM92gq2kpLY9ePS', 'admin', 'active', NULL, NULL, NULL, NULL, '2025-08-02 18:14:04', '2025-08-02 18:14:04', 0, NULL, NULL, NULL, NULL),
(2, 'john_doe', 'john@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active', NULL, NULL, NULL, NULL, '2025-08-04 11:10:08', '2025-08-04 11:10:08', 0, NULL, NULL, NULL, NULL),
(3, 'jane_smith', 'jane@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active', NULL, NULL, NULL, NULL, '2025-08-04 11:10:08', '2025-08-04 11:10:08', 0, NULL, NULL, NULL, NULL),
(4, 'mike_wilson', 'mike@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active', NULL, NULL, NULL, NULL, '2025-08-04 11:10:08', '2025-08-04 11:10:08', 0, NULL, NULL, NULL, NULL),
(5, 'sarah_johnson', 'sarah@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active', NULL, NULL, NULL, NULL, '2025-08-04 11:10:08', '2025-08-04 11:10:08', 0, NULL, NULL, NULL, NULL),
(6, 'david_brown', 'david@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active', NULL, NULL, NULL, NULL, '2025-08-04 11:10:08', '2025-08-04 11:10:08', 0, NULL, NULL, NULL, NULL),
(7, 'electrician_alex', 'alex@workers.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'worker', 'active', NULL, NULL, NULL, NULL, '2025-08-04 11:10:08', '2025-08-04 11:10:08', 0, NULL, NULL, NULL, NULL),
(8, 'plumber_bob', 'bob@workers.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'worker', 'active', NULL, NULL, NULL, NULL, '2025-08-04 11:10:08', '2025-08-04 11:10:08', 0, NULL, NULL, NULL, NULL),
(9, 'cleaner_carol', 'carol@workers.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'worker', 'active', NULL, NULL, NULL, NULL, '2025-08-04 11:10:08', '2025-08-04 11:10:08', 0, NULL, NULL, NULL, NULL),
(10, 'carpenter_dan', 'dan@workers.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'worker', 'active', NULL, NULL, NULL, NULL, '2025-08-04 11:10:08', '2025-08-04 11:10:08', 0, NULL, NULL, NULL, NULL),
(11, 'painter_eve', 'eve@workers.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'worker', 'active', NULL, NULL, NULL, NULL, '2025-08-04 11:10:08', '2025-08-04 11:10:08', 0, NULL, NULL, NULL, NULL),
(12, 'agent_frank', 'frank@agents.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'agent', 'active', NULL, NULL, NULL, NULL, '2025-08-04 11:10:08', '2025-08-04 11:10:08', 0, NULL, NULL, NULL, NULL),
(13, 'agent_grace', 'grace@agents.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'agent', 'active', NULL, NULL, NULL, NULL, '2025-08-04 11:10:08', '2025-08-04 11:10:08', 0, NULL, NULL, NULL, NULL),
(15, 'agent', NULL, '$2y$10$skGR8DBw.BEGbhDMEpFQpenBQEacv.Z3tl7r6/M8ZZ0O7CrDX.pCq', 'agent', 'active', NULL, NULL, NULL, NULL, '2025-08-04 11:52:09', '2025-08-04 11:52:09', 0, NULL, NULL, NULL, NULL),
(28, 'esteham', 'eshasan1287005@gmail.com', '$2y$10$TP5PX2qV8eCAi5bkJWyaLe8gyruSsa9PowkB.wvhdlNh7bXiB85Ha', 'user', 'active', 'uploads/users/68919ce40862d.jpg', NULL, NULL, NULL, '2025-08-05 05:55:48', '2025-08-05 05:56:25', 1, '2025-08-05 01:56:25', NULL, NULL, NULL),
(29, 'esteham1', 'estahamulhasan@gmail.com', '$2y$10$LTAzCSBTZkK7fazXa1s8auZ/tH4vHKxZR7POlU2Uw01V4SDq/0SwW', 'agent', 'pending', 'uploads/users/6891efcd3b6a4.jpg', NULL, NULL, NULL, '2025-08-05 11:49:33', '2025-08-05 11:50:01', 1, '2025-08-05 07:50:01', NULL, NULL, NULL),
(30, 'Delivaryman', 'xet.windsurf@gmail.com', '$2y$10$ZzJeovjWixQGzkf4uh.szOmtDdIbkr7wlWUZYaoXm22dPHYNPwOCi', 'worker', 'pending', 'uploads/users/6892001b441f7.png', NULL, NULL, NULL, '2025-08-05 12:59:07', '2025-08-05 16:34:14', 1, '2025-08-05 08:59:45', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `workers`
--

CREATE TABLE `workers` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `zone_id` int(11) DEFAULT NULL,
  `area_id` int(11) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `phone` varchar(20) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `join_date` date NOT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `address` text NOT NULL,
  `skills` text NOT NULL,
  `emergency_name` varchar(100) DEFAULT NULL,
  `emergency_phone` varchar(20) DEFAULT NULL,
  `emergency_relation` varchar(50) DEFAULT NULL,
  `experience` int(11) DEFAULT 0,
  `hourly_rate` decimal(8,2) DEFAULT 0.00,
  `availability` enum('available','busy','offline') DEFAULT 'available',
  `status` enum('pending','active','inactive','rejected') DEFAULT 'pending',
  `rating` decimal(3,2) DEFAULT 0.00,
  `total_jobs` int(11) DEFAULT 0,
  `rejection_reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `workers`
--

INSERT INTO `workers` (`id`, `user_id`, `zone_id`, `area_id`, `category_id`, `phone`, `image`, `join_date`, `first_name`, `last_name`, `address`, `skills`, `emergency_name`, `emergency_phone`, `emergency_relation`, `experience`, `hourly_rate`, `availability`, `status`, `rating`, `total_jobs`, `rejection_reason`, `created_at`, `updated_at`) VALUES
(1, 6, NULL, NULL, NULL, '+8801712345678', NULL, '0000-00-00', NULL, NULL, 'Dhanmondi, Dhaka', 'Electrical wiring, Light installation, Fan installation', NULL, NULL, NULL, 5, 45.00, 'available', 'active', 4.80, 156, NULL, '2025-08-04 11:10:08', '2025-08-04 11:10:08'),
(2, 7, NULL, NULL, NULL, '+8801812345679', NULL, '0000-00-00', NULL, NULL, 'Gulshan, Dhaka', 'Plumbing repair, Pipe installation, Toilet repair', NULL, NULL, NULL, 8, 50.00, 'available', 'active', 4.60, 203, NULL, '2025-08-04 11:10:08', '2025-08-04 11:10:08'),
(3, 8, NULL, NULL, NULL, '+8801912345680', NULL, '0000-00-00', NULL, NULL, 'Uttara, Dhaka', 'House cleaning, Office cleaning, Deep cleaning', NULL, NULL, NULL, 3, 25.00, 'available', 'active', 4.90, 89, NULL, '2025-08-04 11:10:08', '2025-08-04 11:10:08'),
(4, 9, NULL, NULL, NULL, '+8801612345681', NULL, '0000-00-00', NULL, NULL, 'Mirpur, Dhaka', 'Furniture repair, Cabinet installation, Wood work', NULL, NULL, NULL, 6, 40.00, 'busy', 'active', 4.70, 134, NULL, '2025-08-04 11:10:08', '2025-08-04 11:10:08'),
(5, 10, NULL, NULL, NULL, '+8801512345682', NULL, '0000-00-00', NULL, NULL, 'Savar, Dhaka', 'Interior painting, Exterior painting, Wall design', NULL, NULL, NULL, 4, 35.00, 'available', 'active', 4.50, 98, NULL, '2025-08-04 11:10:08', '2025-08-04 11:10:08'),
(14, 30, 8, 16, 4, '01723581023', NULL, '2025-08-05', 'Spider', 'Hasan', 'Dhaka1204', 'N/A', '', '', '', 2, 200.00, 'available', 'active', 0.00, 0, NULL, '2025-08-05 12:59:13', '2025-08-05 16:31:54');

-- --------------------------------------------------------

--
-- Table structure for table `worker_services`
--

CREATE TABLE `worker_services` (
  `id` int(11) NOT NULL,
  `worker_id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `worker_services`
--

INSERT INTO `worker_services` (`id`, `worker_id`, `service_id`, `created_at`) VALUES
(1, 1, 1, '2025-08-04 11:10:08'),
(2, 1, 2, '2025-08-04 11:10:08'),
(3, 2, 3, '2025-08-04 11:10:08'),
(4, 2, 4, '2025-08-04 11:10:08'),
(5, 3, 5, '2025-08-04 11:10:08'),
(6, 3, 6, '2025-08-04 11:10:08'),
(7, 4, 7, '2025-08-04 11:10:08'),
(8, 4, 8, '2025-08-04 11:10:08'),
(9, 5, 9, '2025-08-04 11:10:08'),
(10, 5, 10, '2025-08-04 11:10:08');

-- --------------------------------------------------------

--
-- Table structure for table `worker_zones`
--

CREATE TABLE `worker_zones` (
  `id` int(11) NOT NULL,
  `worker_id` int(11) NOT NULL,
  `zone_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `worker_zones`
--

INSERT INTO `worker_zones` (`id`, `worker_id`, `zone_id`, `created_at`) VALUES
(1, 1, 1, '2025-08-04 11:10:08'),
(2, 1, 2, '2025-08-04 11:10:08'),
(3, 1, 3, '2025-08-04 11:10:08'),
(4, 2, 1, '2025-08-04 11:10:08'),
(5, 2, 2, '2025-08-04 11:10:08'),
(6, 2, 4, '2025-08-04 11:10:08'),
(7, 3, 3, '2025-08-04 11:10:08'),
(8, 3, 4, '2025-08-04 11:10:08'),
(9, 3, 5, '2025-08-04 11:10:08'),
(10, 4, 5, '2025-08-04 11:10:08'),
(11, 4, 6, '2025-08-04 11:10:08'),
(12, 4, 7, '2025-08-04 11:10:08'),
(13, 5, 1, '2025-08-04 11:10:08'),
(14, 5, 2, '2025-08-04 11:10:08'),
(15, 5, 7, '2025-08-04 11:10:08');

-- --------------------------------------------------------

--
-- Table structure for table `zones`
--

CREATE TABLE `zones` (
  `id` int(11) NOT NULL,
  `upazila_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `zones`
--

INSERT INTO `zones` (`id`, `upazila_id`, `name`, `created_at`) VALUES
(1, 1, 'Dhanmondi Zone 1', '2025-08-04 15:12:27'),
(2, 1, 'Dhanmondi Zone 2', '2025-08-04 15:12:27'),
(3, 2, 'Gulshan Zone 1', '2025-08-04 15:12:27'),
(4, 2, 'Gulshan Zone 2', '2025-08-04 15:12:27'),
(5, 3, 'Uttara Zone 1', '2025-08-04 15:12:27'),
(6, 3, 'Uttara Zone 2', '2025-08-04 15:12:27'),
(7, 4, 'Mirpur Zone 1', '2025-08-04 15:12:27'),
(8, 4, 'Mirpur Zone 2', '2025-08-04 15:12:27'),
(9, 5, 'Gazipur Central Zone', '2025-08-04 15:12:27'),
(10, 5, 'Gazipur Industrial Zone', '2025-08-04 15:12:27');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `agents`
--
ALTER TABLE `agents`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_agent_user` (`user_id`),
  ADD KEY `zone_id` (`zone_id`),
  ADD KEY `area_id` (`area_id`);

--
-- Indexes for table `areas`
--
ALTER TABLE `areas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_area_zone` (`name`,`zone_id`),
  ADD KEY `zone_id` (`zone_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `districts`
--
ALTER TABLE `districts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_district_division` (`name`,`division_id`),
  ADD KEY `division_id` (`division_id`);

--
-- Indexes for table `divisions`
--
ALTER TABLE `divisions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `worker_id` (`worker_id`);

--
-- Indexes for table `email_logs`
--
ALTER TABLE `email_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_email` (`user_id`,`email`),
  ADD KEY `idx_email_type` (`email_type`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `otp_verifications`
--
ALTER TABLE `otp_verifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_email` (`user_id`,`email`),
  ADD KEY `idx_otp_code` (`otp_code`),
  ADD KEY `idx_expires_at` (`expires_at`);

--
-- Indexes for table `pricing_rules`
--
ALTER TABLE `pricing_rules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `zone_id` (`zone_id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `service_request_id` (`service_request_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `worker_id` (`worker_id`);

--
-- Indexes for table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `service_requests`
--
ALTER TABLE `service_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `service_id` (`service_id`),
  ADD KEY `worker_id` (`worker_id`),
  ADD KEY `area_id` (`area_id`);

--
-- Indexes for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`);

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `agent_id` (`agent_id`),
  ADD KEY `worker_id` (`worker_id`);

--
-- Indexes for table `task_assignments`
--
ALTER TABLE `task_assignments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `task_id` (`task_id`),
  ADD KEY `worker_id` (`worker_id`);

--
-- Indexes for table `upazilas`
--
ALTER TABLE `upazilas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_upazila_district` (`name`,`district_id`),
  ADD KEY `district_id` (`district_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `workers`
--
ALTER TABLE `workers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_worker_user` (`user_id`),
  ADD KEY `zone_id` (`zone_id`),
  ADD KEY `area_id` (`area_id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `worker_services`
--
ALTER TABLE `worker_services`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_worker_service` (`worker_id`,`service_id`),
  ADD KEY `service_id` (`service_id`);

--
-- Indexes for table `worker_zones`
--
ALTER TABLE `worker_zones`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_worker_zone` (`worker_id`,`zone_id`),
  ADD KEY `zone_id` (`zone_id`);

--
-- Indexes for table `zones`
--
ALTER TABLE `zones`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_zone_upazila` (`name`,`upazila_id`),
  ADD KEY `upazila_id` (`upazila_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `agents`
--
ALTER TABLE `agents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `areas`
--
ALTER TABLE `areas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `districts`
--
ALTER TABLE `districts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `divisions`
--
ALTER TABLE `divisions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `documents`
--
ALTER TABLE `documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `email_logs`
--
ALTER TABLE `email_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `otp_verifications`
--
ALTER TABLE `otp_verifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `pricing_rules`
--
ALTER TABLE `pricing_rules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `services`
--
ALTER TABLE `services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=83;

--
-- AUTO_INCREMENT for table `service_requests`
--
ALTER TABLE `service_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `system_settings`
--
ALTER TABLE `system_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `tasks`
--
ALTER TABLE `tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `task_assignments`
--
ALTER TABLE `task_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `upazilas`
--
ALTER TABLE `upazilas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `workers`
--
ALTER TABLE `workers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `worker_services`
--
ALTER TABLE `worker_services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `worker_zones`
--
ALTER TABLE `worker_zones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `zones`
--
ALTER TABLE `zones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `agents`
--
ALTER TABLE `agents`
  ADD CONSTRAINT `agents_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `agents_ibfk_2` FOREIGN KEY (`zone_id`) REFERENCES `zones` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `agents_ibfk_3` FOREIGN KEY (`area_id`) REFERENCES `areas` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `areas`
--
ALTER TABLE `areas`
  ADD CONSTRAINT `areas_ibfk_1` FOREIGN KEY (`zone_id`) REFERENCES `zones` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `districts`
--
ALTER TABLE `districts`
  ADD CONSTRAINT `districts_ibfk_1` FOREIGN KEY (`division_id`) REFERENCES `divisions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `documents`
--
ALTER TABLE `documents`
  ADD CONSTRAINT `documents_ibfk_1` FOREIGN KEY (`worker_id`) REFERENCES `workers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `email_logs`
--
ALTER TABLE `email_logs`
  ADD CONSTRAINT `email_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `otp_verifications`
--
ALTER TABLE `otp_verifications`
  ADD CONSTRAINT `otp_verifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `pricing_rules`
--
ALTER TABLE `pricing_rules`
  ADD CONSTRAINT `pricing_rules_ibfk_1` FOREIGN KEY (`zone_id`) REFERENCES `zones` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`service_request_id`) REFERENCES `service_requests` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_3` FOREIGN KEY (`worker_id`) REFERENCES `workers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `services`
--
ALTER TABLE `services`
  ADD CONSTRAINT `services_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `service_requests`
--
ALTER TABLE `service_requests`
  ADD CONSTRAINT `service_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `service_requests_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `service_requests_ibfk_3` FOREIGN KEY (`worker_id`) REFERENCES `workers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `service_requests_ibfk_4` FOREIGN KEY (`area_id`) REFERENCES `areas` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`agent_id`) REFERENCES `agents` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tasks_ibfk_2` FOREIGN KEY (`worker_id`) REFERENCES `workers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `task_assignments`
--
ALTER TABLE `task_assignments`
  ADD CONSTRAINT `task_assignments_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `task_assignments_ibfk_2` FOREIGN KEY (`worker_id`) REFERENCES `workers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `upazilas`
--
ALTER TABLE `upazilas`
  ADD CONSTRAINT `upazilas_ibfk_1` FOREIGN KEY (`district_id`) REFERENCES `districts` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `workers`
--
ALTER TABLE `workers`
  ADD CONSTRAINT `workers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `workers_ibfk_2` FOREIGN KEY (`zone_id`) REFERENCES `zones` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `workers_ibfk_3` FOREIGN KEY (`area_id`) REFERENCES `areas` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `workers_ibfk_4` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `worker_services`
--
ALTER TABLE `worker_services`
  ADD CONSTRAINT `worker_services_ibfk_1` FOREIGN KEY (`worker_id`) REFERENCES `workers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `worker_services_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `worker_zones`
--
ALTER TABLE `worker_zones`
  ADD CONSTRAINT `worker_zones_ibfk_1` FOREIGN KEY (`worker_id`) REFERENCES `workers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `worker_zones_ibfk_2` FOREIGN KEY (`zone_id`) REFERENCES `zones` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `zones`
--
ALTER TABLE `zones`
  ADD CONSTRAINT `zones_ibfk_1` FOREIGN KEY (`upazila_id`) REFERENCES `upazilas` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
