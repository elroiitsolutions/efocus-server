-- Create database if not exists
CREATE DATABASE IF NOT EXISTS `efocus_ecommerce` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `efocus_ecommerce`;

-- Drop tables in reverse order of relationships to prevent constraint issues
DROP TABLE IF EXISTS `product_filter_values`;
DROP TABLE IF EXISTS `filter_options`;
DROP TABLE IF EXISTS `product_filters`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `product_families`;
DROP TABLE IF EXISTS `subcategories`;
DROP TABLE IF EXISTS `categories`;

-- 1. Categories Table
CREATE TABLE `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `category_no` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(255) NOT NULL,
  `priority` INT DEFAULT 0,
  `description` TEXT NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Subcategories Table
CREATE TABLE `subcategories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `category_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_subcategories_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Product Families Table
CREATE TABLE `product_families` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `subcategory_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_product_families_subcategory` FOREIGN KEY (`subcategory_id`) REFERENCES `subcategories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Products Table
CREATE TABLE `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `category_id` INT NOT NULL,
  `subcategory_id` INT NOT NULL,
  `family_id` INT NOT NULL,
  `sku` VARCHAR(100) NOT NULL UNIQUE,
  `catalog_number` VARCHAR(100) NULL,
  `product_name` VARCHAR(255) NOT NULL,
  `brand` VARCHAR(100) NOT NULL,
  `short_description` TEXT NULL,
  `key_spec_1` VARCHAR(255) NULL,
  `key_spec_2` VARCHAR(255) NULL,
  `key_spec_3` VARCHAR(255) NULL,
  `image_status` VARCHAR(50) NULL,
  `rfq_eligible` BOOLEAN DEFAULT TRUE,
  `stock_status` ENUM('in_stock', 'out_of_stock', 'on_backorder') DEFAULT 'in_stock',
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_products_subcategory` FOREIGN KEY (`subcategory_id`) REFERENCES `subcategories` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_products_family` FOREIGN KEY (`family_id`) REFERENCES `product_families` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes for Products
CREATE INDEX `idx_products_category_id` ON `products` (`category_id`);
CREATE INDEX `idx_products_stock_status` ON `products` (`stock_status`);
CREATE INDEX `idx_products_subcategory_id` ON `products` (`subcategory_id`);
CREATE INDEX `idx_products_family_id` ON `products` (`family_id`);
CREATE INDEX `idx_products_sku` ON `products` (`sku`);
CREATE INDEX `idx_products_catalog_number` ON `products` (`catalog_number`);
CREATE INDEX `idx_products_brand` ON `products` (`brand`);
CREATE INDEX `idx_products_product_name` ON `products` (`product_name`);

-- 5. Product Filters (Filter configurations per product family)
CREATE TABLE `product_filters` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `family_id` INT NOT NULL,
  `filter_name` VARCHAR(100) NOT NULL,
  `filter_type` VARCHAR(50) DEFAULT 'select',
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_product_filters_family` FOREIGN KEY (`family_id`) REFERENCES `product_families` (`id`) ON DELETE CASCADE,
  UNIQUE KEY `uq_family_filter` (`family_id`, `filter_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Filter Options (Predefined selectable options for filters)
CREATE TABLE `filter_options` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `filter_id` INT NOT NULL,
  `option_value` VARCHAR(255) NOT NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_filter_options_filter` FOREIGN KEY (`filter_id`) REFERENCES `product_filters` (`id`) ON DELETE CASCADE,
  UNIQUE KEY `uq_filter_option` (`filter_id`, `option_value`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Product Filter Values (Associations between a product, its family filters, and option values)
CREATE TABLE `product_filter_values` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT NOT NULL,
  `filter_id` INT NOT NULL,
  `option_id` INT NULL,
  `value` TEXT NULL, -- Optional text value for freeform filters or cache
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_filter_values_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_filter_values_filter` FOREIGN KEY (`filter_id`) REFERENCES `product_filters` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_filter_values_option` FOREIGN KEY (`option_id`) REFERENCES `filter_options` (`id`) ON DELETE SET NULL,
  UNIQUE KEY `uq_product_filter_option` (`product_id`, `filter_id`, `option_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
