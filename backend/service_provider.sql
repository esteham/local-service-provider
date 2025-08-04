-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 04, 2025 at 04:59 PM
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
  `assigned_zone_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(1, 1, 'Dhanmondi Residential Area', '2025-08-04 11:10:08'),
(2, 1, 'Dhanmondi Commercial Area', '2025-08-04 11:10:08'),
(3, 2, 'Dhanmondi Lake Area', '2025-08-04 11:10:08'),
(4, 3, 'Gulshan Avenue', '2025-08-04 11:10:08'),
(5, 3, 'Gulshan Circle 1', '2025-08-04 11:10:08'),
(6, 4, 'Gulshan Circle 2', '2025-08-04 11:10:08'),
(7, 5, 'Uttara Residential', '2025-08-04 11:10:08'),
(8, 6, 'Uttara Commercial', '2025-08-04 11:10:08'),
(9, 7, 'Mirpur Stadium Area', '2025-08-04 11:10:08'),
(10, 8, 'Mirpur DOHS', '2025-08-04 11:10:08');

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
(1, 1, 'Dhaka', '2025-08-04 11:10:07'),
(2, 1, 'Gazipur', '2025-08-04 11:10:07'),
(3, 1, 'Narayanganj', '2025-08-04 11:10:07'),
(4, 2, 'Chittagong', '2025-08-04 11:10:07'),
(5, 2, 'Comilla', '2025-08-04 11:10:07'),
(6, 3, 'Rajshahi', '2025-08-04 11:10:07'),
(7, 4, 'Khulna', '2025-08-04 11:10:07'),
(8, 5, 'Barisal', '2025-08-04 11:10:07'),
(9, 1, 'demo', '2025-08-04 14:47:13');

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
(1, 'Dhaka', '2025-08-04 11:10:07'),
(2, 'Chittagong', '2025-08-04 11:10:07'),
(3, 'Rajshahi', '2025-08-04 11:10:07'),
(4, 'Khulna', '2025-08-04 11:10:07'),
(5, 'Barisal', '2025-08-04 11:10:07'),
(6, 'Sylhet', '2025-08-04 11:10:07'),
(7, 'Rangpur', '2025-08-04 11:10:07'),
(8, 'Mymensingh', '2025-08-04 11:10:07');

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

--
-- Dumping data for table `documents`
--

INSERT INTO `documents` (`id`, `worker_id`, `doc_type`, `file_path`, `uploaded_at`, `status`) VALUES
(1, 12, 'certificate', '1754310200_WhatsApp Image 2025-07-30 at 22.17.05_0e34d059.jpg', '2025-08-04 12:23:20', 'active');

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
(1, 1, 'Dhanmondi', '2025-08-04 11:10:07'),
(2, 1, 'Gulshan', '2025-08-04 11:10:07'),
(3, 1, 'Uttara', '2025-08-04 11:10:07'),
(4, 1, 'Mirpur', '2025-08-04 11:10:07'),
(5, 2, 'Savar', '2025-08-04 11:10:07'),
(6, 3, 'Narayanganj Sadar', '2025-08-04 11:10:07'),
(7, 4, 'Chittagong Sadar', '2025-08-04 11:10:07'),
(8, 5, 'Comilla Sadar', '2025-08-04 11:10:07');

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
  `status` enum('active','inactive') DEFAULT 'active',
  `image` varchar(200) DEFAULT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expiry` timestamp NULL DEFAULT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `role`, `status`, `image`, `reset_token`, `reset_token_expiry`, `last_login`, `created_at`, `updated_at`) VALUES
(1, 'admin', NULL, '$2y$10$onwZeu03h9HcSY7fnNKYN./hS76D1zswa/TIUNqM92gq2kpLY9ePS', 'admin', 'active', NULL, NULL, NULL, NULL, '2025-08-02 18:14:04', '2025-08-02 18:14:04'),
(2, 'john_doe', 'john@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active', NULL, NULL, NULL, NULL, '2025-08-04 11:10:08', '2025-08-04 11:10:08'),
(3, 'jane_smith', 'jane@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active', NULL, NULL, NULL, NULL, '2025-08-04 11:10:08', '2025-08-04 11:10:08'),
(4, 'mike_wilson', 'mike@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active', NULL, NULL, NULL, NULL, '2025-08-04 11:10:08', '2025-08-04 11:10:08'),
(5, 'sarah_johnson', 'sarah@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active', NULL, NULL, NULL, NULL, '2025-08-04 11:10:08', '2025-08-04 11:10:08'),
(6, 'david_brown', 'david@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active', NULL, NULL, NULL, NULL, '2025-08-04 11:10:08', '2025-08-04 11:10:08'),
(7, 'electrician_alex', 'alex@workers.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'worker', 'active', NULL, NULL, NULL, NULL, '2025-08-04 11:10:08', '2025-08-04 11:10:08'),
(8, 'plumber_bob', 'bob@workers.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'worker', 'active', NULL, NULL, NULL, NULL, '2025-08-04 11:10:08', '2025-08-04 11:10:08'),
(9, 'cleaner_carol', 'carol@workers.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'worker', 'active', NULL, NULL, NULL, NULL, '2025-08-04 11:10:08', '2025-08-04 11:10:08'),
(10, 'carpenter_dan', 'dan@workers.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'worker', 'active', NULL, NULL, NULL, NULL, '2025-08-04 11:10:08', '2025-08-04 11:10:08'),
(11, 'painter_eve', 'eve@workers.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'worker', 'active', NULL, NULL, NULL, NULL, '2025-08-04 11:10:08', '2025-08-04 11:10:08'),
(12, 'agent_frank', 'frank@agents.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'agent', 'active', NULL, NULL, NULL, NULL, '2025-08-04 11:10:08', '2025-08-04 11:10:08'),
(13, 'agent_grace', 'grace@agents.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'agent', 'active', NULL, NULL, NULL, NULL, '2025-08-04 11:10:08', '2025-08-04 11:10:08'),
(14, 'esteham', 'eshasan1287005@gmail.com', '$2y$10$mCrky7K5tSsVU8.4RZtcNeig40ZLjaVJf3miEONvd5YiYZUnzitEy', 'user', 'active', 'uploads/users/6890970b21c3a.jpg', NULL, NULL, NULL, '2025-08-04 11:18:35', '2025-08-04 11:18:35'),
(15, 'agent', NULL, '$2y$10$skGR8DBw.BEGbhDMEpFQpenBQEacv.Z3tl7r6/M8ZZ0O7CrDX.pCq', 'agent', 'active', NULL, NULL, NULL, NULL, '2025-08-04 11:52:09', '2025-08-04 11:52:09'),
(22, 'aljabir', 'estahamulhasan@gmail.com', '$2y$10$SAbRI3LY7/cO3SoGzVS48.1pvZ9HHqo01kLJtzwXqFbw./D2hf5T.', 'worker', 'active', NULL, NULL, NULL, NULL, '2025-08-04 12:23:20', '2025-08-04 12:23:20');

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
(12, 22, 2, 2, 1, '+8801723581023', NULL, '2025-08-04', 'Al Jabir', 'Hasan', 'Dhaka1204', 'Parpenter', '', '', '', 0, 0.00, 'available', 'active', 0.00, 0, NULL, '2025-08-04 12:23:20', '2025-08-04 12:23:20');

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
(1, 1, 'Dhanmondi 1', '2025-08-04 11:10:07'),
(2, 1, 'Dhanmondi 2', '2025-08-04 11:10:07'),
(3, 2, 'Gulshan 1', '2025-08-04 11:10:07'),
(4, 2, 'Gulshan 2', '2025-08-04 11:10:07'),
(5, 3, 'Uttara Sector 1', '2025-08-04 11:10:07'),
(6, 3, 'Uttara Sector 3', '2025-08-04 11:10:07'),
(7, 4, 'Mirpur 1', '2025-08-04 11:10:07'),
(8, 4, 'Mirpur 2', '2025-08-04 11:10:07'),
(9, 5, 'Savar Cantonment', '2025-08-04 11:10:07'),
(10, 6, 'Narayanganj City', '2025-08-04 11:10:07');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `agents`
--
ALTER TABLE `agents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `assigned_zone_id` (`assigned_zone_id`);

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
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `areas`
--
ALTER TABLE `areas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `districts`
--
ALTER TABLE `districts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `divisions`
--
ALTER TABLE `divisions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `documents`
--
ALTER TABLE `documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `workers`
--
ALTER TABLE `workers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `agents`
--
ALTER TABLE `agents`
  ADD CONSTRAINT `agents_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `agents_ibfk_2` FOREIGN KEY (`assigned_zone_id`) REFERENCES `zones` (`id`) ON DELETE SET NULL;

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
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

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
