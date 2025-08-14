-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 14, 2025 at 07:17 AM
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
(3, 29, '01723581023', 'Esteham', 'Hasan', 'Dhaka1204', '2025-08-05', 9, 19, 'active', '2025-08-05 11:49:39', '2025-08-05 16:45:38');

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
-- Table structure for table `cash_payment_codes`
--

CREATE TABLE `cash_payment_codes` (
  `id` int(11) NOT NULL,
  `payment_id` int(11) NOT NULL,
  `service_request_id` int(11) NOT NULL,
  `worker_id` int(11) NOT NULL,
  `verification_code` varchar(6) NOT NULL,
  `is_used` tinyint(1) DEFAULT 0,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `used_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(6, 'Appliance Repairs', 'Home appliance repair services', 'fas fa-toolss', 'active', '2025-08-02 17:54:23');

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
(4, 30, 'xet.windsurf@gmail.com', 'otp_verification', 'Email Verification - OTP Code', 'sent', '2025-08-05 08:59:13', NULL, '2025-08-05 12:59:07'),
(5, 31, 'deepseekspider@gmail.com', 'otp_verification', 'Email Verification - OTP Code', 'sent', '2025-08-08 10:57:10', NULL, '2025-08-08 14:57:04'),
(6, 32, 'xet.kilocode@gmail.com', 'otp_verification', 'Email Verification - OTP Code', 'sent', '2025-08-11 06:41:26', NULL, '2025-08-11 10:41:20'),
(7, 32, 'xet.kilocode@gmail.com', 'otp_verification', 'Email Verification - OTP Code', 'sent', '2025-08-11 06:42:44', NULL, '2025-08-11 10:42:39');

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

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `created_at`) VALUES
(1, 28, 'Service Request Submitted', 'Your service request \'AC Repair Service Request\' has been submitted successfully. Request ID: #1', 'success', 0, '2025-08-06 18:24:35'),
(2, 28, 'Service Request Submitted', 'Your service request \'AC Repair Service Request\' has been submitted successfully. Request ID: #2', 'success', 0, '2025-08-08 13:29:31'),
(3, 31, 'Service Request Submitted', 'Your service request \'AC Repair Service Request\' has been submitted successfully. Request ID: #3', 'success', 0, '2025-08-08 15:30:43'),
(4, 10, 'New Task Assignment', 'You have been assigned to: AC Repair Service Request. Task ID: #', 'info', 0, '2025-08-10 14:39:05'),
(5, 31, 'Worker Assigned', 'A worker has been assigned to your service request: AC Repair Service Request. We will contact you soon.', 'info', 0, '2025-08-10 14:39:05'),
(6, 28, 'Service Request Submitted', 'Your service request \'AC Repair Service Request\' has been submitted successfully. Request ID: #4', 'success', 0, '2025-08-10 14:50:35'),
(7, 30, 'New Service Assignment', 'You have been assigned to: AC Repair Service Request. Request ID: #4', 'info', 0, '2025-08-10 14:51:35'),
(8, 28, 'Worker Assigned', 'A worker has been assigned to your service request: AC Repair Service Request. We will contact you soon.', 'info', 0, '2025-08-10 14:51:35'),
(9, 28, 'Service Started', 'Your service request \'AC Repair Service Request\' has been started by the worker.', 'info', 0, '2025-08-10 15:05:15'),
(10, 28, 'Service Completed', 'Your service request \'AC Repair Service Request\' has been completed successfully.', 'info', 0, '2025-08-10 15:05:18'),
(11, 31, 'Service Request Submitted', 'Your service request \'Refrigerator Repair Service Request\' has been submitted successfully. Request ID: #5', 'success', 0, '2025-08-14 02:58:46'),
(12, 30, 'New Service Assignment', 'You have been assigned to: Refrigerator Repair Service Request. Request ID: #5', 'info', 0, '2025-08-14 03:00:10'),
(13, 31, 'Worker Assigned', 'A worker has been assigned to your service request: Refrigerator Repair Service Request. We will contact you soon.', 'info', 0, '2025-08-14 03:00:10'),
(14, 31, 'Service Started', 'Your service request \'Refrigerator Repair Service Request\' has been started by the worker.', 'info', 0, '2025-08-14 03:00:37'),
(15, 31, 'Service Completed', 'Your service request \'Refrigerator Repair Service Request\' has been completed successfully.', 'info', 0, '2025-08-14 03:02:25'),
(16, 31, 'Service Request Submitted', 'Your service request \'Seasonal Cleanup Service Request\' has been submitted successfully. Request ID: #6', 'success', 0, '2025-08-14 03:21:47'),
(17, 30, 'New Service Assignment', 'You have been assigned to: Seasonal Cleanup Service Request. Request ID: #6', 'info', 0, '2025-08-14 03:22:04'),
(18, 31, 'Worker Assigned', 'A worker has been assigned to your service request: Seasonal Cleanup Service Request. We will contact you soon.', 'info', 0, '2025-08-14 03:22:04'),
(19, 31, 'Service Started', 'Your service request \'Seasonal Cleanup Service Request\' has been started by the worker.', 'info', 0, '2025-08-14 03:22:12'),
(20, 31, 'Service Completed', 'Your service request \'Seasonal Cleanup Service Request\' has been completed successfully.', 'info', 0, '2025-08-14 03:22:13'),
(21, 31, 'Service Request Submitted', 'Your service request \'Tree Trimming Service Request\' has been submitted successfully. Request ID: #7', 'success', 0, '2025-08-14 03:25:12'),
(22, 30, 'New Service Assignment', 'You have been assigned to: Tree Trimming Service Request. Request ID: #7', 'info', 0, '2025-08-14 03:25:31'),
(23, 31, 'Worker Assigned', 'A worker has been assigned to your service request: Tree Trimming Service Request. We will contact you soon.', 'info', 0, '2025-08-14 03:25:31'),
(24, 31, 'Service Started', 'Your service request \'Tree Trimming Service Request\' has been started by the worker.', 'info', 0, '2025-08-14 03:25:41'),
(25, 31, 'Service Completed', 'Your service request \'Tree Trimming Service Request\' has been completed successfully.', 'info', 0, '2025-08-14 03:25:42'),
(26, 31, 'Service Request Submitted', 'Your service request \'Lawn Mowing Service Request\' has been submitted successfully. Request ID: #8', 'success', 0, '2025-08-14 03:56:47'),
(27, 30, 'New Service Assignment', 'You have been assigned to: Lawn Mowing Service Request. Request ID: #8', 'info', 0, '2025-08-14 03:57:07'),
(28, 31, 'Worker Assigned', 'A worker has been assigned to your service request: Lawn Mowing Service Request. We will contact you soon.', 'info', 0, '2025-08-14 03:57:07'),
(29, 31, 'Service Started', 'Your service request \'Lawn Mowing Service Request\' has been started by the worker.', 'info', 0, '2025-08-14 03:58:19'),
(30, 31, 'Service Completed', 'Your service request \'Lawn Mowing Service Request\' has been completed successfully.', 'info', 0, '2025-08-14 03:58:20');

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
(4, 30, 'xet.windsurf@gmail.com', '955494', 'registration', '2025-08-05 12:59:45', 1, 1, 3, '2025-08-05 12:59:07', '2025-08-05 12:59:45'),
(5, 31, 'deepseekspider@gmail.com', '968732', 'registration', '2025-08-08 14:57:39', 1, 1, 3, '2025-08-08 14:57:04', '2025-08-08 14:57:39'),
(7, 32, 'xet.kilocode@gmail.com', '604845', 'registration', '2025-08-11 10:42:56', 1, 1, 3, '2025-08-11 10:42:39', '2025-08-11 10:42:56');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `service_request_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `worker_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` enum('online','cash','card') NOT NULL,
  `payment_status` enum('pending','processing','completed','failed','cancelled') DEFAULT 'pending',
  `transaction_id` varchar(255) DEFAULT NULL,
  `gateway_response` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`gateway_response`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `paid_at` timestamp NULL DEFAULT NULL,
  `otp_verified` tinyint(1) DEFAULT 0,
  `otp_verified_at` datetime DEFAULT NULL,
  `slip_generated` tinyint(1) DEFAULT 0,
  `completed_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `service_request_id`, `user_id`, `worker_id`, `amount`, `payment_method`, `payment_status`, `transaction_id`, `gateway_response`, `created_at`, `updated_at`, `paid_at`, `otp_verified`, `otp_verified_at`, `slip_generated`, `completed_at`) VALUES
(6, 8, 31, 14, 45.50, 'cash', 'pending', NULL, NULL, '2025-08-14 04:17:52', '2025-08-14 04:28:19', NULL, 1, '2025-08-14 06:27:21', 0, NULL),
(12, 7, 31, 14, 156.00, 'cash', 'completed', NULL, NULL, '2025-08-14 04:32:53', '2025-08-14 04:33:40', NULL, 1, '2025-08-14 06:33:40', 1, '2025-08-14 06:33:40'),
(13, 6, 31, 14, 195.00, 'cash', 'completed', NULL, NULL, '2025-08-14 04:39:39', '2025-08-14 04:39:56', NULL, 1, '2025-08-14 06:39:56', 1, '2025-08-14 06:39:56');

-- --------------------------------------------------------

--
-- Table structure for table `payment_logs`
--

CREATE TABLE `payment_logs` (
  `id` int(11) NOT NULL,
  `payment_id` int(11) NOT NULL,
  `action` varchar(50) NOT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payment_logs`
--

INSERT INTO `payment_logs` (`id`, `payment_id`, `action`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES
(10, 6, 'created', '{\"payment_method\":\"cash\",\"amount\":\"45.50\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-14 04:17:52'),
(11, 6, 'cash_payment_initiated', '{\"otp_sent\":true,\"expires_at\":\"2025-08-15 06:17:52\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-14 04:17:56'),
(19, 12, 'created', '{\"payment_method\":\"cash\",\"amount\":\"156.00\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-14 04:32:53'),
(20, 12, 'cash_payment_initiated', '{\"otp_sent\":true,\"expires_at\":\"2025-08-15 06:32:53\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-14 04:32:58'),
(21, 12, 'confirmation_emails_sent', '{\"user_email_sent\":true,\"worker_email_sent\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-14 04:33:49'),
(22, 12, 'otp_verified', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-14 04:33:49'),
(23, 13, 'created', '{\"payment_method\":\"cash\",\"amount\":\"195.00\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-14 04:39:39'),
(24, 13, 'cash_payment_initiated', '{\"otp_sent\":true,\"expires_at\":\"2025-08-15 06:39:39\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-14 04:39:43'),
(25, 13, 'confirmation_emails_sent', '{\"user_email_sent\":true,\"worker_email_sent\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-14 04:40:04'),
(26, 13, 'otp_verified', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-08-14 04:40:04');

-- --------------------------------------------------------

--
-- Table structure for table `payment_otps`
--

CREATE TABLE `payment_otps` (
  `id` int(11) NOT NULL,
  `payment_id` int(11) NOT NULL,
  `service_request_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `worker_id` int(11) NOT NULL,
  `otp_code` varchar(6) NOT NULL,
  `expires_at` datetime NOT NULL,
  `is_used` tinyint(1) DEFAULT 0,
  `used_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payment_otps`
--

INSERT INTO `payment_otps` (`id`, `payment_id`, `service_request_id`, `user_id`, `worker_id`, `otp_code`, `expires_at`, `is_used`, `used_at`, `created_at`, `updated_at`) VALUES
(4, 6, 8, 31, 14, '855328', '2025-08-15 06:17:52', 1, '2025-08-14 06:27:21', '2025-08-14 04:17:52', '2025-08-14 04:27:21'),
(7, 12, 7, 31, 14, '663760', '2025-08-15 06:32:53', 1, '2025-08-14 06:33:40', '2025-08-14 04:32:53', '2025-08-14 04:33:40'),
(8, 13, 6, 31, 14, '928798', '2025-08-15 06:39:39', 1, '2025-08-14 06:39:56', '2025-08-14 04:39:39', '2025-08-14 04:39:56');

-- --------------------------------------------------------

--
-- Table structure for table `payment_slips`
--

CREATE TABLE `payment_slips` (
  `id` int(11) NOT NULL,
  `payment_id` int(11) NOT NULL,
  `service_request_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `worker_id` int(11) NOT NULL,
  `slip_number` varchar(20) NOT NULL,
  `service_name` varchar(255) NOT NULL,
  `service_description` text DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` enum('cash','online') NOT NULL,
  `payment_date` datetime NOT NULL,
  `worker_name` varchar(255) NOT NULL,
  `worker_phone` varchar(20) DEFAULT NULL,
  `user_name` varchar(255) NOT NULL,
  `user_email` varchar(255) NOT NULL,
  `transaction_id` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payment_slips`
--

INSERT INTO `payment_slips` (`id`, `payment_id`, `service_request_id`, `user_id`, `worker_id`, `slip_number`, `service_name`, `service_description`, `amount`, `payment_method`, `payment_date`, `worker_name`, `worker_phone`, `user_name`, `user_email`, `transaction_id`, `created_at`, `updated_at`) VALUES
(2, 12, 7, 31, 14, 'PS20250814000012', 'Tree Trimming', 'Professional tree pruning and trimming', 156.00, 'cash', '2025-08-14 06:33:40', ' ', '01723581023', ' ', 'deepseekspider@gmail.com', NULL, '2025-08-14 04:33:40', '2025-08-14 04:33:40'),
(3, 13, 6, 31, 14, 'PS20250814000013', 'Seasonal Cleanup', 'Spring and fall yard cleanup services', 195.00, 'cash', '2025-08-14 06:39:56', ' ', '01723581023', ' ', 'deepseekspider@gmail.com', NULL, '2025-08-14 04:39:56', '2025-08-14 04:39:56');

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
  `image` varchar(200) DEFAULT NULL,
  `base_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `unit` varchar(50) DEFAULT 'hour',
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `services`
--

INSERT INTO `services` (`id`, `category_id`, `name`, `description`, `image`, `base_price`, `unit`, `status`, `created_at`) VALUES
(1, 1, 'Electrical Wiring', 'Complete electrical wiring for homes and offices', 'uploads/services/service_689a008cbfba8.jpg', 50.00, 'hour', 'active', '2025-08-02 17:54:23'),
(2, 1, 'Light Installation', 'Installation of lights and fixtures', 'uploads/services/service_689a00d293257.jpg', 25.00, 'piece', 'active', '2025-08-02 17:54:23'),
(3, 2, 'Pipe Repair', 'Repair of leaking or broken pipes', 'uploads/services/service_689a00f3c2df2.jpg', 40.00, 'hour', 'active', '2025-08-02 17:54:23'),
(4, 2, 'Toilet Installation', 'Installation of new toilets', 'uploads/services/service_689a0112ea898.jpg', 80.00, 'piece', 'active', '2025-08-02 17:54:23'),
(5, 3, 'House Cleaning', 'Complete house cleaning service', 'uploads/services/service_689a0122a94aa.jpeg', 30.00, 'hour', 'active', '2025-08-02 17:54:23'),
(6, 3, 'Office Cleaning', 'Professional office cleaning', 'uploads/services/service_689a014b0729a.jpeg', 35.00, 'hour', 'active', '2025-08-02 17:54:23'),
(7, 4, 'Furniture Repair', 'Repair of wooden furniture', 'uploads/services/service_689a016ce3e91.jpg', 45.00, 'hour', 'active', '2025-08-02 17:54:23'),
(8, 4, 'Cabinet Installation', 'Installation of kitchen cabinets', 'uploads/services/service_689a019469b4d.jpg', 60.00, 'hour', 'active', '2025-08-02 17:54:23'),
(9, 5, 'Interior Painting', 'Interior wall painting', 'uploads/services/service_689a01c9c302b.jpg', 25.00, 'sqft', 'active', '2025-08-02 17:54:23'),
(10, 5, 'Exterior Painting', 'Exterior wall painting', 'uploads/services/service_689a01e6cfd2c.jpeg', 30.00, 'sqft', 'active', '2025-08-02 17:54:23'),
(11, 6, 'AC Repair', 'Air conditioner repair and maintenance\r\nAir conditioner repair and maintenance\r\nAir conditioner repair and maintenance\r\nAir conditioner repair and maintenance', 'uploads/services/service_689a0212cbec9.jpg', 55.00, 'hour', 'active', '2025-08-02 17:54:23'),
(12, 6, 'Refrigerator Repair', 'Refrigerator repair service', 'uploads/services/service_689a0246ba58e.jpeg', 50.00, 'hour', 'active', '2025-08-02 17:54:23'),
(53, 1, 'Emergency Plumbing Repair', '24/7 emergency plumbing services for urgent repairs', 'uploads/services/service_689a050529432.jpg', 120.00, 'hour', 'active', '2025-08-03 16:19:57'),
(54, 1, 'Pipe Installation', 'Professional pipe installation and replacement services', 'uploads/services/service_6899f8b661b40.jpg', 85.00, 'hour', 'active', '2025-08-03 16:19:57'),
(55, 1, 'Test Service Update', 'Test description', 'uploads/services/service_6899f8cc1cd12.png', 100.00, 'hour', 'active', '2025-08-03 16:19:57'),
(56, 1, 'Water Heater Installation', 'Water heater installation and maintenance', 'uploads/services/service_6899f8fa54924.jpg', 250.00, 'job', 'active', '2025-08-03 16:19:57'),
(57, 1, 'Bathroom Plumbing', 'Complete bathroom plumbing installation and repair', 'uploads/services/service_6899f917e83f6.jpg', 150.00, 'project', 'active', '2025-08-03 16:19:57'),
(58, 2, 'Electrical Panel Upgrade', 'Upgrade your electrical panel for safety and capacity', 'uploads/services/service_6899f94249728.jpg', 800.00, 'project', 'active', '2025-08-03 16:19:57'),
(59, 2, 'Lighting Installation', 'Professional lighting fixture installation', 'uploads/services/service_6899f9afdd045.png', 75.00, 'hour', 'active', '2025-08-03 16:19:57'),
(60, 2, 'Outlet Installation', 'Install new electrical outlets and switches', 'uploads/services/service_6899f9d9d8f8d.jpg', 65.00, 'hour', 'active', '2025-08-03 16:19:57'),
(61, 2, 'Wiring Services', 'Complete home and office wiring services', 'uploads/services/service_6899fa09853d8.jpg', 90.00, 'hour', 'active', '2025-08-03 16:19:57'),
(62, 2, 'Generator Installation', 'Backup generator installation and maintenance', 'uploads/services/service_6899fa7cc62b8.jpg', 1200.00, 'project', 'active', '2025-08-03 16:19:57'),
(63, 3, 'AC Installation', 'Professional air conditioning system installation\r\nProfessional air conditioning system installation\r\nProfessional air conditioning system installation\r\nProfessional air conditioning system installation\r\n', 'uploads/services/service_6899fae3a592a.webp', 2500.00, 'project', 'active', '2025-08-03 16:19:57'),
(64, 3, 'Furnace Repair', 'Heating system repair and maintenance', 'uploads/services/service_6899fac843938.jpg', 120.00, 'hour', 'active', '2025-08-03 16:19:57'),
(65, 3, 'Duct Cleaning', 'Professional air duct cleaning services', 'uploads/services/service_6899fb04e990c.jpg', 300.00, 'job', 'active', '2025-08-03 16:19:57'),
(66, 3, 'Thermostat Installation', 'Smart thermostat installation and setup', 'uploads/services/service_6899fb305b288.webp', 150.00, 'job', 'active', '2025-08-03 16:19:57'),
(67, 3, 'HVAC Maintenance', 'Regular HVAC system maintenance and inspection', 'uploads/services/service_6899fb5c14c09.webp', 180.00, 'visit', 'active', '2025-08-03 16:19:57'),
(68, 4, 'House Cleaning', 'Complete residential cleaning services', 'uploads/services/service_6899fefbad66d.jpeg', 25.00, 'hour', 'active', '2025-08-03 16:19:57'),
(69, 4, 'Deep Cleaning', 'Thorough deep cleaning for homes and offices', 'uploads/services/service_6899fbc65d11b.jpg', 35.00, 'hour', 'active', '2025-08-03 16:19:57'),
(70, 4, 'Carpet Cleaning', 'Professional carpet and upholstery cleaning', 'uploads/services/service_6899fc3c59802.jpg', 45.00, 'hour', 'active', '2025-08-03 16:19:57'),
(71, 4, 'Window Cleaning', 'Interior and exterior window cleaning', 'uploads/services/service_6899fc5f4ccbf.jpg', 30.00, 'hour', 'active', '2025-08-03 16:19:57'),
(72, 4, 'Move-in/Move-out Cleaning', 'Specialized cleaning for moving situations', 'uploads/services/service_6899fc91acf7b.png', 200.00, 'job', 'active', '2025-08-03 16:19:57'),
(73, 5, 'General Repairs', 'Various home repair and maintenance tasks', 'uploads/services/service_6899fcd3e81bf.webp', 55.00, 'hour', 'active', '2025-08-03 16:19:57'),
(74, 5, 'Furniture Assembly', 'Professional furniture assembly services', 'uploads/services/service_6899fd553f343.jpg', 40.00, 'hour', 'active', '2025-08-03 16:19:57'),
(75, 5, 'Drywall Repair', 'Drywall patching and repair services', 'uploads/services/service_6899fd84bf81b.jpg', 60.00, 'hour', 'active', '2025-08-03 16:19:57'),
(76, 5, 'Door Installation', 'Interior and exterior door installation', 'uploads/services/service_6899fe47a8e92.jpg', 180.00, 'job', 'active', '2025-08-03 16:19:57'),
(77, 5, 'Shelving Installation', 'Custom shelving and storage solutions', 'uploads/services/service_6899fe935bcc1.jpeg', 70.00, 'hour', 'active', '2025-08-03 16:19:57'),
(78, 6, 'Lawn Mowing', 'Regular lawn maintenance and mowing services', 'uploads/services/service_6899ff95bd871.jpg', 35.00, 'visit', 'active', '2025-08-03 16:19:57'),
(79, 6, 'Garden Design', 'Custom garden design and landscaping', 'uploads/services/service_6899ffdb6fcaa.webp', 80.00, 'hour', 'active', '2025-08-03 16:19:57'),
(80, 6, 'Tree Trimming', 'Professional tree pruning and trimming', 'uploads/services/service_689a000ce77e9.jpeg', 120.00, 'job', 'active', '2025-08-03 16:19:57'),
(81, 6, 'Irrigation Installation', 'Sprinkler system installation and repair', 'uploads/services/service_689a0036a55fb.jpeg', 200.00, 'project', 'active', '2025-08-03 16:19:57'),
(82, 6, 'Seasonal Cleanup', 'Spring and fall yard cleanup services', 'uploads/services/service_689a0062282e0.jpg', 150.00, 'job', 'active', '2025-08-03 16:19:57'),
(84, 4, 'Demo', 'Test add', 'assets/uploads/services/service_68978e4a9b833.png', 100.00, 'hour', 'active', '2025-08-09 18:07:06');

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
  `status` enum('pending','assigned','in_progress','completed','payment_pending','paid','cancelled') DEFAULT 'pending',
  `payment_status` enum('pending','paid','failed','refunded') DEFAULT 'pending',
  `payment_method` enum('online','cash','card') DEFAULT NULL,
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

--
-- Dumping data for table `service_requests`
--

INSERT INTO `service_requests` (`id`, `user_id`, `service_id`, `worker_id`, `area_id`, `title`, `description`, `address`, `service_type`, `urgency`, `status`, `payment_status`, `payment_method`, `base_price`, `final_price`, `price_breakdown`, `scheduled_at`, `started_at`, `completed_at`, `cancelled_at`, `cancellation_reason`, `created_at`, `updated_at`) VALUES
(1, 31, 11, NULL, 1, 'AC Repair Service Request', 'Service request for AC Repair', 'Dhaka1204', '', 'normal', 'payment_pending', 'pending', 'cash', 55.00, 71.50, '{\"base_price\":\"55.00\",\"multipliers\":{\"zone\":{\"factor\":1,\"description\":\"Zone-based pricing\"},\"availability\":{\"factor\":1.3,\"description\":\"Provider availability based pricing\"}},\"final_price\":71.5}', '2025-11-11 05:11:00', NULL, '2025-08-14 00:12:59', '2025-08-08 04:01:22', NULL, '2025-08-06 18:24:35', '2025-08-14 04:30:49'),
(2, 31, 11, NULL, 1, 'AC Repair Service Request', 'Service request for AC Repair', 'n/a', '', 'normal', 'paid', '', 'cash', 55.00, 71.50, '{\"base_price\":\"55.00\",\"multipliers\":{\"zone\":{\"factor\":1,\"description\":\"Zone-based pricing\"},\"availability\":{\"factor\":1.3,\"description\":\"Provider availability based pricing\"}},\"final_price\":71.5}', '2025-11-11 05:11:00', NULL, '2025-08-14 00:10:43', NULL, NULL, '2025-08-08 13:29:31', '2025-08-14 04:31:42'),
(3, 31, 11, 5, 5, 'AC Repair Service Request', 'Service request for AC Repair', 'Dhaka1204', '', 'normal', 'completed', 'pending', NULL, 55.00, 71.50, '{\"base_price\":\"55.00\",\"multipliers\":{\"zone\":{\"factor\":1,\"description\":\"Zone-based pricing\"},\"availability\":{\"factor\":1.3,\"description\":\"Provider availability based pricing\"}},\"final_price\":71.5}', '2025-11-11 05:11:00', NULL, '2025-08-14 00:11:48', NULL, NULL, '2025-08-08 15:30:43', '2025-08-14 00:11:48'),
(4, 31, 11, 14, 16, 'AC Repair Service Request', 'Service request for AC Repair', 'Test request', '', 'normal', 'completed', 'pending', NULL, 55.00, 71.50, '{\"base_price\":\"55.00\",\"multipliers\":{\"zone\":{\"factor\":1,\"description\":\"Zone-based pricing\"},\"availability\":{\"factor\":1.3,\"description\":\"Provider availability based pricing\"}},\"final_price\":71.5}', '2025-10-10 05:11:00', '2025-08-10 11:05:15', '2025-08-10 11:05:18', NULL, NULL, '2025-08-10 14:50:35', '2025-08-14 04:17:30'),
(5, 31, 12, 14, 16, 'Refrigerator Repair Service Request', 'Service request for Refrigerator Repair', 'Dhaka1204', '', 'normal', 'completed', 'pending', 'cash', 50.00, 65.00, '{\"base_price\":\"50.00\",\"multipliers\":{\"zone\":{\"factor\":1,\"description\":\"Zone-based pricing\"},\"availability\":{\"factor\":1.3,\"description\":\"Provider availability based pricing\"}},\"final_price\":65}', '2025-08-22 08:00:00', '2025-08-13 23:00:37', '2025-08-14 00:12:59', NULL, NULL, '2025-08-14 02:58:46', '2025-08-14 00:12:59'),
(6, 31, 82, 14, 16, 'Seasonal Cleanup Service Request', 'Service request for Seasonal Cleanup', 'Dhaka1204', '', 'normal', 'paid', '', 'cash', 150.00, 195.00, '{\"base_price\":\"150.00\",\"multipliers\":{\"zone\":{\"factor\":1,\"description\":\"Zone-based pricing\"},\"availability\":{\"factor\":1.3,\"description\":\"Provider availability based pricing\"}},\"final_price\":195}', '2025-08-15 08:00:00', '2025-08-13 23:22:12', '2025-08-14 00:12:59', NULL, NULL, '2025-08-14 03:21:47', '2025-08-14 04:39:56'),
(7, 31, 80, 14, 16, 'Tree Trimming Service Request', 'Service request for Tree Trimming', 'Dhaka1204', '', 'normal', 'paid', '', 'cash', 120.00, 156.00, '{\"base_price\":\"120.00\",\"multipliers\":{\"zone\":{\"factor\":1,\"description\":\"Zone-based pricing\"},\"availability\":{\"factor\":1.3,\"description\":\"Provider availability based pricing\"}},\"final_price\":156}', '2025-08-14 05:00:00', '2025-08-13 23:25:41', '2025-08-14 00:12:59', NULL, NULL, '2025-08-14 03:25:12', '2025-08-14 04:33:40'),
(8, 31, 78, 14, 16, 'Lawn Mowing Service Request', 'Service request for Lawn Mowing', 'Dhaka1204', '', 'normal', 'payment_pending', 'pending', 'cash', 35.00, 45.50, '{\"base_price\":\"35.00\",\"multipliers\":{\"zone\":{\"factor\":1,\"description\":\"Zone-based pricing\"},\"availability\":{\"factor\":1.3,\"description\":\"Provider availability based pricing\"}},\"final_price\":45.5}', '2025-08-14 10:00:00', '2025-08-13 23:58:19', '2025-08-14 00:15:37', NULL, NULL, '2025-08-14 03:56:47', '2025-08-14 04:17:52');

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
(5, 'commission_rate', '10', 'Commission rate percentage for completed services', '2025-08-02 17:54:23'),
(6, 'payment_commission_rate', '10.00', 'Platform commission rate percentage', '2025-08-14 03:02:10'),
(7, 'cash_payment_code_expiry', '24', 'Cash payment verification code expiry in hours', '2025-08-14 03:02:10'),
(8, 'payment_gateway_enabled', 'true', 'Enable online payment gateway', '2025-08-14 03:02:10'),
(9, 'payment_methods_enabled', 'online,cash', 'Comma-separated list of enabled payment methods', '2025-08-14 03:02:10');

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
(2, 'john_doe', 'john@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'inactive', NULL, NULL, NULL, NULL, '2025-08-04 11:10:08', '2025-08-09 18:27:10', 0, NULL, NULL, NULL, NULL),
(3, 'jane_smith', 'jane@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active', NULL, NULL, NULL, NULL, '2025-08-04 11:10:08', '2025-08-04 11:10:08', 0, NULL, NULL, NULL, NULL),
(4, 'mike_wilson', 'mike@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active', NULL, NULL, NULL, NULL, '2025-08-04 11:10:08', '2025-08-04 11:10:08', 0, NULL, NULL, NULL, NULL),
(5, 'sarah_johnson', 'sarah@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active', NULL, NULL, NULL, NULL, '2025-08-04 11:10:08', '2025-08-04 11:10:08', 0, NULL, NULL, NULL, NULL),
(6, 'david_brown', 'david@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'inactive', NULL, NULL, NULL, NULL, '2025-08-04 11:10:08', '2025-08-09 18:23:50', 0, NULL, NULL, NULL, NULL),
(7, 'electrician_alex', 'alex@workers.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'worker', 'active', NULL, NULL, NULL, NULL, '2025-08-04 11:10:08', '2025-08-04 11:10:08', 0, NULL, NULL, NULL, NULL),
(8, 'plumber_bob', 'bob@workers.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'worker', 'inactive', NULL, NULL, NULL, NULL, '2025-08-04 11:10:08', '2025-08-05 16:50:40', 0, NULL, NULL, NULL, NULL),
(9, 'cleaner_carol', 'carol@workers.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'worker', 'active', NULL, NULL, NULL, NULL, '2025-08-04 11:10:08', '2025-08-04 11:10:08', 0, NULL, NULL, NULL, NULL),
(10, 'carpenter_dan', 'dan@workers.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'worker', 'active', NULL, NULL, NULL, NULL, '2025-08-04 11:10:08', '2025-08-04 11:10:08', 0, NULL, NULL, NULL, NULL),
(11, 'painter_eve', 'eve@workers.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'worker', 'active', NULL, NULL, NULL, NULL, '2025-08-04 11:10:08', '2025-08-04 11:10:08', 0, NULL, NULL, NULL, NULL),
(12, 'agent_frank', 'frank@agents.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'agent', 'inactive', NULL, NULL, NULL, NULL, '2025-08-04 11:10:08', '2025-08-08 08:01:08', 0, NULL, NULL, NULL, NULL),
(13, 'agent_grace', 'grace@agents.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'agent', 'active', NULL, NULL, NULL, NULL, '2025-08-04 11:10:08', '2025-08-04 11:10:08', 0, NULL, NULL, NULL, NULL),
(15, 'agent', NULL, '$2y$10$skGR8DBw.BEGbhDMEpFQpenBQEacv.Z3tl7r6/M8ZZ0O7CrDX.pCq', 'agent', 'inactive', NULL, NULL, NULL, NULL, '2025-08-04 11:52:09', '2025-08-09 18:27:06', 0, NULL, NULL, NULL, NULL),
(28, 'esteham 4', 'eshasan1287005@gmail.com', '$2y$10$TP5PX2qV8eCAi5bkJWyaLe8gyruSsa9PowkB.wvhdlNh7bXiB85Ha', 'user', 'active', 'uploads/users/68919ce40862d.jpg', NULL, NULL, NULL, '2025-08-05 05:55:48', '2025-08-08 14:38:17', 1, '2025-08-05 01:56:25', NULL, NULL, NULL),
(29, 'esteham1', 'estahamulhasan@gmail.com', '$2y$10$LTAzCSBTZkK7fazXa1s8auZ/tH4vHKxZR7POlU2Uw01V4SDq/0SwW', 'agent', 'active', 'uploads/users/6891efcd3b6a4.jpg', NULL, NULL, NULL, '2025-08-05 11:49:33', '2025-08-05 16:45:38', 1, '2025-08-05 07:50:01', NULL, NULL, NULL),
(30, 'Delivaryman', 'xet.windsurf@gmail.com', '$2y$10$ZzJeovjWixQGzkf4uh.szOmtDdIbkr7wlWUZYaoXm22dPHYNPwOCi', 'worker', 'active', 'uploads/users/6892001b441f7.png', NULL, NULL, NULL, '2025-08-05 12:59:07', '2025-08-05 16:47:28', 1, '2025-08-05 08:59:45', NULL, NULL, NULL),
(31, 'zihad01', 'deepseekspider@gmail.com', '$2y$10$2b3ShehvOUInXxUwf2Xy0u1Pzo9zaAO/VUogaLcikOGgmXknU0Sd6', 'user', 'active', '/assets/uploads/users/689610404fea2.jpg', NULL, NULL, NULL, '2025-08-08 14:57:04', '2025-08-13 03:53:16', 1, '2025-08-08 10:57:39', NULL, NULL, '01723581023'),
(32, 'spider', 'xet.kilocode@gmail.com', '$2y$10$bytKBOlqa4xU6RKl27U7le4ZK4c2mFRyEM/rjtjo/x7DZ2nHpprC2', 'worker', 'active', '/assets/uploads/users/6899c8d017216.png', NULL, NULL, NULL, '2025-08-11 10:41:20', '2025-08-11 17:59:02', 1, '2025-08-11 06:42:57', 'Esteham', 'Hasan', '01723581023');

-- --------------------------------------------------------

--
-- Stand-in structure for view `user_payment_history`
-- (See below for the actual view)
--
CREATE TABLE `user_payment_history` (
`payment_id` int(11)
,`user_id` int(11)
,`amount` decimal(10,2)
,`payment_method` enum('online','cash','card')
,`payment_status` enum('pending','processing','completed','failed','cancelled')
,`otp_verified` tinyint(1)
,`payment_date` timestamp
,`last_updated` timestamp
,`service_request_id` int(11)
,`service_title` varchar(200)
,`service_name` varchar(100)
,`service_description` text
,`worker_name` varchar(201)
,`worker_phone` varchar(20)
,`slip_number` varchar(20)
,`transaction_id` varchar(100)
);

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
(2, 7, NULL, NULL, NULL, '+8801812345679', NULL, '0000-00-00', NULL, NULL, 'Gulshan, Dhaka', 'Plumbing repair, Pipe installation, Toilet repair', NULL, NULL, NULL, 8, 50.00, 'available', 'active', 4.60, 203, NULL, '2025-08-04 11:10:08', '2025-08-04 11:10:08'),
(4, 9, NULL, NULL, NULL, '+8801612345681', NULL, '0000-00-00', NULL, NULL, 'Mirpur, Dhaka', 'Furniture repair, Cabinet installation, Wood work', NULL, NULL, NULL, 6, 40.00, 'busy', 'active', 4.70, 134, NULL, '2025-08-04 11:10:08', '2025-08-04 11:10:08'),
(5, 10, 2, 5, NULL, '+8801512345682', NULL, '0000-00-00', NULL, NULL, 'Savar, Dhaka', 'Interior painting, Exterior painting, Wall design', NULL, NULL, NULL, 4, 35.00, 'available', 'active', 4.50, 98, NULL, '2025-08-04 11:10:08', '2025-08-10 14:28:28'),
(14, 30, 8, 16, 4, '01723581023', NULL, '2025-08-05', 'Spider', 'Hasan', 'Dhaka1204', 'N/A', '', '', '', 2, 200.00, 'available', 'active', 0.00, 0, NULL, '2025-08-05 12:59:13', '2025-08-05 16:31:54'),
(15, 32, 7, 15, 4, '01723581023', NULL, '2025-08-11', 'Esteham', 'Hasan', 'Dhaka1204', 'N/A', '', '', '', 1, 99.99, 'available', 'active', 0.00, 0, NULL, '2025-08-11 10:41:26', '2025-08-11 17:59:02');

-- --------------------------------------------------------

--
-- Table structure for table `worker_earnings`
--

CREATE TABLE `worker_earnings` (
  `id` int(11) NOT NULL,
  `worker_id` int(11) NOT NULL,
  `payment_id` int(11) NOT NULL,
  `service_request_id` int(11) NOT NULL,
  `gross_amount` decimal(10,2) NOT NULL,
  `commission_rate` decimal(5,2) NOT NULL DEFAULT 10.00,
  `commission_amount` decimal(10,2) NOT NULL,
  `net_amount` decimal(10,2) NOT NULL,
  `status` enum('pending','processed','paid') DEFAULT 'pending',
  `processed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Stand-in structure for view `worker_payment_history`
-- (See below for the actual view)
--
CREATE TABLE `worker_payment_history` (
`payment_id` int(11)
,`worker_id` int(11)
,`amount` decimal(10,2)
,`payment_method` enum('online','cash','card')
,`payment_status` enum('pending','processing','completed','failed','cancelled')
,`otp_verified` tinyint(1)
,`payment_date` timestamp
,`last_updated` timestamp
,`service_request_id` int(11)
,`service_title` varchar(200)
,`service_name` varchar(100)
,`service_description` text
,`customer_name` varchar(100)
,`customer_email` varchar(100)
,`slip_number` varchar(20)
,`transaction_id` varchar(100)
);

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
(3, 2, 3, '2025-08-04 11:10:08'),
(4, 2, 4, '2025-08-04 11:10:08'),
(7, 4, 7, '2025-08-04 11:10:08'),
(8, 4, 8, '2025-08-04 11:10:08'),
(9, 5, 9, '2025-08-04 11:10:08'),
(10, 5, 10, '2025-08-04 11:10:08');

-- --------------------------------------------------------

--
-- Table structure for table `worker_settings`
--

CREATE TABLE `worker_settings` (
  `id` int(11) NOT NULL,
  `worker_id` int(11) NOT NULL,
  `email_notifications` tinyint(1) DEFAULT 1,
  `sms_notifications` tinyint(1) DEFAULT 1,
  `auto_accept_radius` int(11) DEFAULT 10,
  `working_hours_start` time DEFAULT '09:00:00',
  `working_hours_end` time DEFAULT '17:00:00',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `worker_settings`
--

INSERT INTO `worker_settings` (`id`, `worker_id`, `email_notifications`, `sms_notifications`, `auto_accept_radius`, `working_hours_start`, `working_hours_end`, `created_at`, `updated_at`) VALUES
(1, 14, 1, 1, 10, '09:00:00', '17:00:00', '2025-08-10 16:23:08', '2025-08-10 16:23:08');

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
(4, 2, 1, '2025-08-04 11:10:08'),
(5, 2, 2, '2025-08-04 11:10:08'),
(6, 2, 4, '2025-08-04 11:10:08'),
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

-- --------------------------------------------------------

--
-- Structure for view `user_payment_history`
--
DROP TABLE IF EXISTS `user_payment_history`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `user_payment_history`  AS SELECT `p`.`id` AS `payment_id`, `p`.`user_id` AS `user_id`, `p`.`amount` AS `amount`, `p`.`payment_method` AS `payment_method`, `p`.`payment_status` AS `payment_status`, `p`.`otp_verified` AS `otp_verified`, `p`.`created_at` AS `payment_date`, `p`.`updated_at` AS `last_updated`, `sr`.`id` AS `service_request_id`, `sr`.`title` AS `service_title`, `s`.`name` AS `service_name`, `s`.`description` AS `service_description`, coalesce(concat(`w`.`first_name`,' ',`w`.`last_name`),`w_user`.`username`) AS `worker_name`, `w`.`phone` AS `worker_phone`, `ps`.`slip_number` AS `slip_number`, `ps`.`transaction_id` AS `transaction_id` FROM (((((`payments` `p` join `service_requests` `sr` on(`p`.`service_request_id` = `sr`.`id`)) left join `services` `s` on(`sr`.`service_id` = `s`.`id`)) join `workers` `w` on(`p`.`worker_id` = `w`.`id`)) join `users` `w_user` on(`w`.`user_id` = `w_user`.`id`)) left join `payment_slips` `ps` on(`p`.`id` = `ps`.`payment_id`)) WHERE `p`.`user_id` is not null ;

-- --------------------------------------------------------

--
-- Structure for view `worker_payment_history`
--
DROP TABLE IF EXISTS `worker_payment_history`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `worker_payment_history`  AS SELECT `p`.`id` AS `payment_id`, `p`.`worker_id` AS `worker_id`, `p`.`amount` AS `amount`, `p`.`payment_method` AS `payment_method`, `p`.`payment_status` AS `payment_status`, `p`.`otp_verified` AS `otp_verified`, `p`.`created_at` AS `payment_date`, `p`.`updated_at` AS `last_updated`, `sr`.`id` AS `service_request_id`, `sr`.`title` AS `service_title`, `s`.`name` AS `service_name`, `s`.`description` AS `service_description`, `u`.`username` AS `customer_name`, `u`.`email` AS `customer_email`, `ps`.`slip_number` AS `slip_number`, `ps`.`transaction_id` AS `transaction_id` FROM ((((`payments` `p` join `service_requests` `sr` on(`p`.`service_request_id` = `sr`.`id`)) left join `services` `s` on(`sr`.`service_id` = `s`.`id`)) join `users` `u` on(`p`.`user_id` = `u`.`id`)) left join `payment_slips` `ps` on(`p`.`id` = `ps`.`payment_id`)) WHERE `p`.`worker_id` is not null ;

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
-- Indexes for table `cash_payment_codes`
--
ALTER TABLE `cash_payment_codes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_code_payment` (`verification_code`,`payment_id`),
  ADD KEY `payment_id` (`payment_id`),
  ADD KEY `service_request_id` (`service_request_id`),
  ADD KEY `worker_id` (`worker_id`),
  ADD KEY `idx_verification_code` (`verification_code`),
  ADD KEY `idx_expires_at` (`expires_at`);

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
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `worker_id` (`worker_id`),
  ADD KEY `idx_service_request` (`service_request_id`),
  ADD KEY `idx_payment_status` (`payment_status`),
  ADD KEY `idx_payment_method` (`payment_method`);

--
-- Indexes for table `payment_logs`
--
ALTER TABLE `payment_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_payment_id` (`payment_id`),
  ADD KEY `idx_action` (`action`);

--
-- Indexes for table `payment_otps`
--
ALTER TABLE `payment_otps`
  ADD PRIMARY KEY (`id`),
  ADD KEY `service_request_id` (`service_request_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `worker_id` (`worker_id`),
  ADD KEY `idx_otp_code` (`otp_code`),
  ADD KEY `idx_payment_id` (`payment_id`),
  ADD KEY `idx_expires_at` (`expires_at`);

--
-- Indexes for table `payment_slips`
--
ALTER TABLE `payment_slips`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slip_number` (`slip_number`),
  ADD KEY `service_request_id` (`service_request_id`),
  ADD KEY `idx_slip_number` (`slip_number`),
  ADD KEY `idx_payment_id` (`payment_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_worker_id` (`worker_id`);

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
-- Indexes for table `worker_earnings`
--
ALTER TABLE `worker_earnings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `payment_id` (`payment_id`),
  ADD KEY `service_request_id` (`service_request_id`),
  ADD KEY `idx_worker_id` (`worker_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `worker_services`
--
ALTER TABLE `worker_services`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_worker_service` (`worker_id`,`service_id`),
  ADD KEY `service_id` (`service_id`);

--
-- Indexes for table `worker_settings`
--
ALTER TABLE `worker_settings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `worker_id` (`worker_id`);

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
-- AUTO_INCREMENT for table `cash_payment_codes`
--
ALTER TABLE `cash_payment_codes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `otp_verifications`
--
ALTER TABLE `otp_verifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `payment_logs`
--
ALTER TABLE `payment_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `payment_otps`
--
ALTER TABLE `payment_otps`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `payment_slips`
--
ALTER TABLE `payment_slips`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=85;

--
-- AUTO_INCREMENT for table `service_requests`
--
ALTER TABLE `service_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `system_settings`
--
ALTER TABLE `system_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `workers`
--
ALTER TABLE `workers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `worker_earnings`
--
ALTER TABLE `worker_earnings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `worker_services`
--
ALTER TABLE `worker_services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `worker_settings`
--
ALTER TABLE `worker_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

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
-- Constraints for table `cash_payment_codes`
--
ALTER TABLE `cash_payment_codes`
  ADD CONSTRAINT `cash_payment_codes_ibfk_1` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cash_payment_codes_ibfk_2` FOREIGN KEY (`service_request_id`) REFERENCES `service_requests` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cash_payment_codes_ibfk_3` FOREIGN KEY (`worker_id`) REFERENCES `workers` (`id`) ON DELETE CASCADE;

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
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`service_request_id`) REFERENCES `service_requests` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payments_ibfk_3` FOREIGN KEY (`worker_id`) REFERENCES `workers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payment_logs`
--
ALTER TABLE `payment_logs`
  ADD CONSTRAINT `payment_logs_ibfk_1` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payment_otps`
--
ALTER TABLE `payment_otps`
  ADD CONSTRAINT `payment_otps_ibfk_1` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payment_otps_ibfk_2` FOREIGN KEY (`service_request_id`) REFERENCES `service_requests` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payment_otps_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payment_otps_ibfk_4` FOREIGN KEY (`worker_id`) REFERENCES `workers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payment_slips`
--
ALTER TABLE `payment_slips`
  ADD CONSTRAINT `payment_slips_ibfk_1` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payment_slips_ibfk_2` FOREIGN KEY (`service_request_id`) REFERENCES `service_requests` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payment_slips_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payment_slips_ibfk_4` FOREIGN KEY (`worker_id`) REFERENCES `workers` (`id`) ON DELETE CASCADE;

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
-- Constraints for table `worker_earnings`
--
ALTER TABLE `worker_earnings`
  ADD CONSTRAINT `worker_earnings_ibfk_1` FOREIGN KEY (`worker_id`) REFERENCES `workers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `worker_earnings_ibfk_2` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `worker_earnings_ibfk_3` FOREIGN KEY (`service_request_id`) REFERENCES `service_requests` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `worker_services`
--
ALTER TABLE `worker_services`
  ADD CONSTRAINT `worker_services_ibfk_1` FOREIGN KEY (`worker_id`) REFERENCES `workers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `worker_services_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `worker_settings`
--
ALTER TABLE `worker_settings`
  ADD CONSTRAINT `worker_settings_ibfk_1` FOREIGN KEY (`worker_id`) REFERENCES `workers` (`id`) ON DELETE CASCADE;

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
