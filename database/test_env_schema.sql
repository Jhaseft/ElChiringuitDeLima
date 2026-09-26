-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: 76.13.148.149    Database: u248181817_TransferCash
-- ------------------------------------------------------
-- Server version	11.8.6-MariaDB-ubu2404
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `account_owners`
--

DROP TABLE IF EXISTS `account_owners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `account_owners` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `full_name` varchar(255) NOT NULL,
  `document_number` varchar(50) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_account_owners_document` (`document_number`),
  KEY `idx_account_owners_phone` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=291 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `accounts`
--

DROP TABLE IF EXISTS `accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accounts` (
  `id` varchar(36) NOT NULL,
  `method_type` enum('bank','qr') DEFAULT 'bank',
  `user_id` char(36) NOT NULL,
  `bank_id` bigint(20) DEFAULT NULL,
  `account_number` varchar(50) DEFAULT NULL,
  `qr_value` varchar(255) DEFAULT NULL,
  `qr_country` enum('PE','BO') DEFAULT NULL,
  `account_type` enum('origin','destination') NOT NULL DEFAULT 'destination',
  `owner_id` bigint(20) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `desactivate` tinyint(1) NOT NULL DEFAULT 0,
  `qr_active_flag` tinyint(1) GENERATED ALWAYS AS (case when `method_type` = 'qr' and `desactivate` = 0 then 1 else NULL end) VIRTUAL,
  `bank_active_flag` tinyint(1) GENERATED ALWAYS AS (case when `method_type` = 'bank' and `desactivate` = 0 then 1 else NULL end) VIRTUAL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_qr_active` (`user_id`,`qr_country`,`qr_active_flag`),
  UNIQUE KEY `uq_bank_active` (`user_id`,`account_number`,`account_type`,`bank_active_flag`),
  KEY `bank_id` (`bank_id`),
  KEY `idx_accounts_user_id` (`user_id`),
  KEY `idx_accounts_account_number` (`account_number`),
  KEY `idx_accounts_owner_id` (`owner_id`),
  CONSTRAINT `accounts_ibfk_2` FOREIGN KEY (`bank_id`) REFERENCES `banks` (`id`),
  CONSTRAINT `accounts_ibfk_3` FOREIGN KEY (`owner_id`) REFERENCES `account_owners` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `activity_logs`
--

DROP TABLE IF EXISTS `activity_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_logs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `level` varchar(20) NOT NULL,
  `canal` varchar(50) DEFAULT NULL,
  `mensaje` text NOT NULL,
  `contexto` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`contexto`)),
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `ip` varchar(45) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_level` (`level`),
  KEY `idx_canal` (`canal`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=487 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `admin_accounts`
--

DROP TABLE IF EXISTS `admin_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_accounts` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `banks`
--

DROP TABLE IF EXISTS `banks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `banks` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `country` enum('bolivia','peru') NOT NULL,
  `logo_url` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `banners`
--

DROP TABLE IF EXISTS `banners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `banners` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `image_url` varchar(255) NOT NULL,
  `sort_order` int(10) unsigned NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `banners_is_active_sort_order_index` (`is_active`,`sort_order`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `configuracion`
--

DROP TABLE IF EXISTS `configuracion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `configuracion` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `clave` varchar(100) NOT NULL COMMENT 'Nombre interno de la variable (ej: pips_compra)',
  `valor` varchar(255) NOT NULL COMMENT 'Valor almacenado como texto',
  `tipo` enum('decimal','entero','texto','booleano') NOT NULL DEFAULT 'decimal',
  `etiqueta` varchar(150) NOT NULL COMMENT 'Nombre legible para el admin',
  `descripcion` text DEFAULT NULL COMMENT 'Explicación de qué hace esta variable',
  `grupo` varchar(80) NOT NULL DEFAULT 'general' COMMENT 'Agrupación en el panel (tipo_cambio, limites, etc.)',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `clave` (`clave`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `exchange_rates`
--

DROP TABLE IF EXISTS `exchange_rates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exchange_rates` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `value` decimal(10,4) NOT NULL,
  `source` varchar(255) DEFAULT NULL,
  `set_by_user_id` char(36) DEFAULT NULL,
  `set_by_telegram_id` bigint(20) unsigned DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_failed_jobs_queue` (`queue`(768))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) unsigned NOT NULL,
  `reserved_at` int(10) unsigned DEFAULT NULL,
  `available_at` int(10) unsigned NOT NULL,
  `created_at` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_jobs_queue` (`queue`)
) ENGINE=InnoDB AUTO_INCREMENT=4032 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`email`),
  KEY `idx_password_resets_token` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `payment_methods`
--

DROP TABLE IF EXISTS `payment_methods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_methods` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `slug` varchar(50) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `last_used_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `token_unique` (`token`),
  KEY `idx_pat_tokenable` (`tokenable_type`,`tokenable_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2432 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `push_tokens`
--

DROP TABLE IF EXISTS `push_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `push_tokens` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `push_tokens_user_id_foreign` (`user_id`),
  CONSTRAINT `push_tokens_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=554 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_sessions_user_id` (`user_id`),
  KEY `idx_sessions_last_activity` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tc_canjes`
--

DROP TABLE IF EXISTS `tc_canjes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tc_canjes` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` char(36) NOT NULL,
  `producto_id` bigint(20) unsigned NOT NULL,
  `puntos_usados` decimal(15,4) NOT NULL,
  `status` enum('pendiente','completado','cancelado') NOT NULL DEFAULT 'pendiente',
  `notas` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_tcc_user_id` (`user_id`),
  KEY `idx_tcc_producto_id` (`producto_id`),
  KEY `idx_tcc_status` (`status`),
  CONSTRAINT `fk_tcc_producto` FOREIGN KEY (`producto_id`) REFERENCES `tc_productos` (`id`),
  CONSTRAINT `fk_tcc_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tc_categorias`
--

DROP TABLE IF EXISTS `tc_categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tc_categorias` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  `descripcion` varchar(500) DEFAULT NULL,
  `imagen_url` varchar(500) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `orden` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tc_productos`
--

DROP TABLE IF EXISTS `tc_productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tc_productos` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `categoria_id` bigint(20) unsigned NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `imagen_url` varchar(500) DEFAULT NULL,
  `costo_puntos` decimal(10,2) NOT NULL,
  `stock` int(11) DEFAULT NULL COMMENT 'NULL = ilimitado',
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `orden` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_tcp_categoria_id` (`categoria_id`),
  CONSTRAINT `fk_tcp_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `tc_categorias` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tc_puntos`
--

DROP TABLE IF EXISTS `tc_puntos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tc_puntos` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` char(36) NOT NULL,
  `balance` decimal(15,4) NOT NULL DEFAULT 0.0000,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tc_puntos_user` (`user_id`),
  CONSTRAINT `fk_tc_puntos_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tc_puntos_transacciones`
--

DROP TABLE IF EXISTS `tc_puntos_transacciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tc_puntos_transacciones` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` char(36) NOT NULL,
  `transfer_id` bigint(20) DEFAULT NULL,
  `puntos` decimal(15,4) NOT NULL,
  `tipo` enum('ganado','canjeado','ajuste') NOT NULL DEFAULT 'ganado',
  `descripcion` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_tcpt_user_id` (`user_id`),
  KEY `idx_tcpt_transfer_id` (`transfer_id`),
  KEY `idx_tcpt_tipo` (`tipo`),
  CONSTRAINT `fk_tcpt_transfer` FOREIGN KEY (`transfer_id`) REFERENCES `transfers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_tcpt_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=295 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tipo_cambio`
--

DROP TABLE IF EXISTS `tipo_cambio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipo_cambio` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `compra` decimal(10,2) NOT NULL,
  `venta` decimal(10,2) NOT NULL,
  `fecha_actualizacion` timestamp NULL DEFAULT current_timestamp(),
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12113 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `transaction_receipts`
--

DROP TABLE IF EXISTS `transaction_receipts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transaction_receipts` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `transaction_id` bigint(20) NOT NULL,
  `receipt_url` varchar(255) NOT NULL,
  `receipt_type` enum('client','admin') NOT NULL,
  `uploaded_by` char(36) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_receipt_transaction` (`transaction_id`),
  CONSTRAINT `fk_receipt_transaction` FOREIGN KEY (`transaction_id`) REFERENCES `transfers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8956 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `transfer_methods`
--

DROP TABLE IF EXISTS `transfer_methods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transfer_methods` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `currency_pair` enum('BOBtoPEN','PENtoBOB') NOT NULL,
  `type` varchar(50) NOT NULL,
  `title` varchar(100) NOT NULL,
  `number` varchar(100) DEFAULT NULL,
  `image` text NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `transfers`
--

DROP TABLE IF EXISTS `transfers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transfers` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` char(36) DEFAULT NULL,
  `payment_method_id` bigint(20) unsigned DEFAULT NULL,
  `origin_account_id` char(36) DEFAULT NULL,
  `destination_account_id` char(36) DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `converted_amount` decimal(12,2) DEFAULT NULL,
  `modo` enum('BOBtoPEN','PENtoBOB') NOT NULL,
  `exchange_rate` decimal(10,4) NOT NULL,
  `status` enum('pending','verified','completed','rejected') NOT NULL DEFAULT 'pending',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_transfers_user_id` (`user_id`),
  KEY `idx_transfers_origin_account` (`origin_account_id`),
  KEY `idx_transfers_destination_account` (`destination_account_id`),
  KEY `idx_transfers_status` (`status`),
  KEY `fk_transfers_payment_method` (`payment_method_id`),
  CONSTRAINT `fk_transfers_payment_method` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4944 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_media`
--

DROP TABLE IF EXISTS `user_media`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_media` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` char(36) DEFAULT NULL,
  `media_type` enum('image','video') NOT NULL,
  `url` text NOT NULL,
  `public_id` varchar(255) NOT NULL,
  `format` varchar(50) DEFAULT NULL,
  `position` tinyint(4) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_position` (`user_id`,`position`)
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` char(36) NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `nationality` enum('boliviano','peruano') DEFAULT NULL,
  `document_number` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `kyc_status` enum('pending','verified','rejected') NOT NULL DEFAULT 'pending',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `kyc_session_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `phone` (`phone`),
  UNIQUE KEY `document_number` (`document_number`),
  KEY `idx_users_email` (`email`),
  KEY `idx_users_phone` (`phone`),
  KEY `idx_users_document` (`document_number`),
  KEY `idx_users_first_name` (`first_name`),
  KEY `idx_users_last_name` (`last_name`),
  KEY `idx_users_document_number` (`document_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-26  1:09:14


-- ============================================
-- DATOS DE CONFIGURACION BASICA
-- ============================================

-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: 76.13.148.149    Database: u248181817_TransferCash
-- ------------------------------------------------------
-- Server version	11.8.6-MariaDB-ubu2404
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'2025_08_28_130545_create_exchange_rates_table',1),(2,'2026_04_24_120000_partial_unique_indexes_on_accounts',2);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `banks`
--

LOCK TABLES `banks` WRITE;
/*!40000 ALTER TABLE `banks` DISABLE KEYS */;
INSERT INTO `banks` VALUES (1,'Banco Nacional De Bolivia','bolivia','https://res.cloudinary.com/dnbklbswg/image/upload/v1756304904/bnb_dwughq.png','2025-08-23 18:48:15'),(3,'BCP-Bolivia','bolivia','https://res.cloudinary.com/dnbklbswg/image/upload/v1756304903/bcp_mtkdyl.png','2025-08-23 18:48:15'),(4,'Banco Mercantil Santa Cruz','bolivia','https://res.cloudinary.com/dnbklbswg/image/upload/v1756304905/mercantil_tt6gy7.png','2025-08-23 18:48:15'),(5,'Banco Union','bolivia','https://res.cloudinary.com/dnbklbswg/image/upload/v1756304904/union_apsloj.png','2025-08-23 18:48:15'),(6,'Banco FIE','bolivia','https://res.cloudinary.com/dnbklbswg/image/upload/v1756304905/fie_tbdoin.png','2025-08-23 18:48:15'),(7,'Banco Ganadero','bolivia','https://res.cloudinary.com/dnbklbswg/image/upload/v1756304903/ganandero_s2l1gd.png','2025-08-23 18:48:15'),(8,'Banco BISA','bolivia','https://res.cloudinary.com/dnbklbswg/image/upload/v1756304908/bisa_aomeef.png','2025-08-23 18:48:15'),(9,'Banco Solidario','bolivia','https://res.cloudinary.com/dnbklbswg/image/upload/v1756304904/sol_okhzxz.png','2025-08-23 18:48:15'),(11,'Banco Fortaleza','bolivia','https://res.cloudinary.com/dnbklbswg/image/upload/v1756304904/fortaleza_khtieg.png','2025-08-23 18:48:15'),(12,'Banco Economico','bolivia','https://res.cloudinary.com/dnbklbswg/image/upload/v1756304905/economico_ypconc.png','2025-08-23 18:48:15'),(13,'Pyme Ecofuturo','bolivia','https://res.cloudinary.com/dnbklbswg/image/upload/v1756304904/pyme_ecofuturo_gjij2x.png','2025-08-23 18:48:15'),(15,'BCP-Peru','peru','https://res.cloudinary.com/dnbklbswg/image/upload/v1756304903/bcp_mtkdyl.png','2025-08-23 18:48:16'),(16,'Interbank','peru','https://res.cloudinary.com/dnbklbswg/image/upload/v1756305466/download_zxsiny.png','2025-08-23 18:48:16'),(17,'Yape','peru','https://res.cloudinary.com/dnbklbswg/image/upload/v1756359619/yape-logo-png_seeklogo-504685_tns3su.png','2025-09-10 17:00:27'),(18,'Plin','peru','https://res.cloudinary.com/dnbklbswg/image/upload/v1756359595/plin_fi3i8u.png','2025-09-10 17:00:27');
/*!40000 ALTER TABLE `banks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `payment_methods`
--

LOCK TABLES `payment_methods` WRITE;
/*!40000 ALTER TABLE `payment_methods` DISABLE KEYS */;
INSERT INTO `payment_methods` VALUES (1,'Efectivo','cash',1,'2026-04-06 04:56:05','2026-04-06 04:56:05'),(2,'Transferencia Bancaria','bank_transfer',1,'2026-04-06 04:56:05','2026-04-06 04:56:05'),(3,'QR','qr',1,'2026-04-06 04:56:05','2026-04-06 04:56:05');
/*!40000 ALTER TABLE `payment_methods` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `transfer_methods`
--

LOCK TABLES `transfer_methods` WRITE;
/*!40000 ALTER TABLE `transfer_methods` DISABLE KEYS */;
INSERT INTO `transfer_methods` VALUES (1,'BOBtoPEN','qr','QR Bolivia',NULL,'https://res.cloudinary.com/dqemzxnqj/image/upload/v1789498542/transfer-methods/wujxqi6j20jzy0zd6lwp.jpg',NULL,'2026-09-15 14:55:43'),(2,'PENtoBOB','Yape','Yape Perú','915394932','https://res.cloudinary.com/dnbklbswg/image/upload/v1756359619/yape-logo-png_seeklogo-504685_tns3su.png',NULL,'2026-04-16 11:02:31'),(3,'PENtoBOB','Plin','Plin Perú','915394932','https://res.cloudinary.com/dnbklbswg/image/upload/v1756359595/plin_fi3i8u.png',NULL,'2026-04-16 11:03:51'),(4,'PENtoBOB','InterBank','InterBank Perú','8983188118811','https://res.cloudinary.com/dnbklbswg/image/upload/v1756305466/download_zxsiny.png',NULL,'2026-04-20 08:20:35'),(5,'PENtoBOB','BCP','BCP Perú','19107032722059','https://res.cloudinary.com/dnbklbswg/image/upload/v1756304903/bcp_mtkdyl.png',NULL,'2026-04-20 08:21:08');
/*!40000 ALTER TABLE `transfer_methods` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `configuracion`
--

LOCK TABLES `configuracion` WRITE;
/*!40000 ALTER TABLE `configuracion` DISABLE KEYS */;
INSERT INTO `configuracion` VALUES (1,'pips_compra','0.03','decimal','Pips Compra','Ajuste adicional al tipo de cambio de compra (PEN→BOB)','tipo_cambio',NULL,'2026-09-25 18:39:30'),(2,'pips_venta','0.04','decimal','Pips Venta','Ajuste adicional al tipo de cambio de venta (BOB→PEN)','tipo_cambio',NULL,'2026-09-25 18:39:30'),(4,'transfer_min_pen','20','decimal','Transferencia mínima PEN','Monto mínimo permitido para transferencias en soles (PEN)','transferencias','2026-05-16 18:11:02','2026-08-11 15:35:54'),(5,'transfer_min_bob','60','decimal','Transferencia mínima BOB','Monto mínimo permitido para transferencias en bolivianos (BOB)','transferencias','2026-05-16 18:11:02','2026-08-11 15:35:55'),(6,'transfer_kyc_limit_pen','3000','decimal','Límite KYC PEN','Monto máximo acumulado en PEN antes de requerir verificación KYC','transferencias','2026-05-16 18:11:02','2026-08-11 15:35:55'),(7,'transfer_kyc_limit_bob','10000','decimal','Límite KYC BOB','Monto máximo acumulado en BOB antes de requerir verificación KYC','transferencias','2026-05-16 18:11:02','2026-08-11 15:35:56'),(8,'modo_automatico','1','booleano','Modo automático','Si está activo, el tipo de cambio se actualiza solo desde Binance. Si se desactiva, queda fijo.','tipo_cambio','2026-06-15 12:33:56','2026-09-25 18:39:30'),(9,'transfer_max_bob','100000','decimal','Transferencia maxima BOB','Monto maxoimo permitido para transferencias en bolivianos (BOB)','transferencias','2026-05-16 18:11:02','2026-08-11 15:35:56'),(10,'transfer_max_pen','100000','decimal','Transferencia maxima PEN','Monto maxoimo permitido para transferencias en SOLES (PEN)','transferencias','2026-05-16 18:11:02','2026-08-11 15:35:57');
/*!40000 ALTER TABLE `configuracion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `tc_categorias`
--

LOCK TABLES `tc_categorias` WRITE;
/*!40000 ALTER TABLE `tc_categorias` DISABLE KEYS */;
INSERT INTO `tc_categorias` VALUES (1,'OKTAVA X TRANSFER CASH','Super Promocion con OKTAVA','https://res.cloudinary.com/dqemzxnqj/image/upload/v1779480000/tc-categorias/r4hsla5vlddvddh4lbff.jpg',0,1,'2026-05-20 18:31:41','2026-05-29 10:20:03'),(2,'Mejorar Tipo de Cambio','Mejora el tipo de cambio de una transaccion','https://res.cloudinary.com/dqemzxnqj/image/upload/v1779481372/tc-categorias/wgdzclvbprztvrrn4eh0.jpg',0,0,'2026-05-22 16:21:16','2026-05-22 17:23:33');
/*!40000 ALTER TABLE `tc_categorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `tc_productos`
--

LOCK TABLES `tc_productos` WRITE;
/*!40000 ALTER TABLE `tc_productos` DISABLE KEYS */;
INSERT INTO `tc_productos` VALUES (2,2,'0.008','Puntos de Mejora','https://res.cloudinary.com/dqemzxnqj/image/upload/v1779481422/tc-productos/blyqxocy5ymtujnheetb.jpg',2.00,NULL,1,0,'2026-05-22 16:23:42','2026-05-22 17:07:58');
/*!40000 ALTER TABLE `tc_productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `banners`
--

LOCK TABLES `banners` WRITE;
/*!40000 ALTER TABLE `banners` DISABLE KEYS */;
INSERT INTO `banners` VALUES (2,'https://res.cloudinary.com/dnbklbswg/image/upload/v1789226444/banners/tnkoykbmuo0c4llpfpxq.png',0,1,'2026-09-12 11:20:45','2026-09-12 11:20:45'),(3,'https://res.cloudinary.com/dnbklbswg/image/upload/v1789226883/banners/z8ohkc4vdajge1jug57h.png',2,1,'2026-09-12 11:28:04','2026-09-12 11:43:47'),(4,'https://res.cloudinary.com/dnbklbswg/image/upload/v1789227743/banners/jrrvnpxydjkaavxduao9.png',1,1,'2026-09-12 11:42:24','2026-09-12 11:43:37');
/*!40000 ALTER TABLE `banners` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-26  1:10:53
