/*
SQLyog Community v13.1.9 (64 bit)
MySQL - 9.5.0 : Database - StockMaster
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`StockMaster` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `StockMaster`;

/*Table structure for table `adjustment_items` */

DROP TABLE IF EXISTS `adjustment_items`;

CREATE TABLE `adjustment_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `adjustment_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  `quantity` decimal(14,4) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_adjustment_items_adjustment` (`adjustment_id`),
  KEY `fk_adjustment_items_product` (`product_id`),
  CONSTRAINT `fk_adjustment_items_adjustment` FOREIGN KEY (`adjustment_id`) REFERENCES `adjustments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_adjustment_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `adjustment_items` */

/*Table structure for table `adjustments` */

DROP TABLE IF EXISTS `adjustments`;

CREATE TABLE `adjustments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `warehouse_id` bigint NOT NULL,
  `reason` text,
  `status` varchar(50) DEFAULT 'Draft',
  `created_by` bigint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_adjustments_warehouse` (`warehouse_id`),
  KEY `fk_adjustments_created_by` (`created_by`),
  CONSTRAINT `fk_adjustments_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_adjustments_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `adjustments` */

/*Table structure for table `deliveries` */

DROP TABLE IF EXISTS `deliveries`;

CREATE TABLE `deliveries` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `customer_name` varchar(255) NOT NULL,
  `address` text,
  `warehouse_id` bigint NOT NULL,
  `schedule_at` timestamp NULL DEFAULT NULL,
  `ref_no` varchar(100) DEFAULT NULL,
  `remarks` text,
  `operation_type` varchar(50) DEFAULT NULL,
  `status` enum('Draft','Waiting','Ready','Done','Canceled') DEFAULT 'Draft',
  `created_by` bigint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  `confirmed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_deliveries_warehouse` (`warehouse_id`),
  KEY `fk_deliveries_user` (`created_by`),
  CONSTRAINT `fk_deliveries_user` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_deliveries_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `deliveries` */

/*Table structure for table `delivery_items` */

DROP TABLE IF EXISTS `delivery_items`;

CREATE TABLE `delivery_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `delivery_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  `qty` decimal(14,4) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_delivery_items_delivery` (`delivery_id`),
  KEY `fk_delivery_items_product` (`product_id`),
  CONSTRAINT `fk_delivery_items_delivery` FOREIGN KEY (`delivery_id`) REFERENCES `deliveries` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_delivery_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `delivery_items` */

/*Table structure for table `otps` */

DROP TABLE IF EXISTS `otps`;

CREATE TABLE `otps` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(254) NOT NULL,
  `otp` varchar(6) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `ix_otps_expires_at` (`expires_at`),
  KEY `ix_otps_email` (`email`),
  KEY `ix_otps_id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `otps` */

/*Table structure for table `product_categories` */

DROP TABLE IF EXISTS `product_categories`;

CREATE TABLE `product_categories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `description` text,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `product_categories` */

insert  into `product_categories`(`id`,`name`,`created_at`,`description`,`is_active`) values 
(2,'mobile','2025-11-22 10:47:49',NULL,1);

/*Table structure for table `products` */

DROP TABLE IF EXISTS `products`;

CREATE TABLE `products` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `sku` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(255) NOT NULL,
  `category_id` bigint DEFAULT NULL,
  `uom` enum('kg','lb','oz','L','gal','fl oz','Piece','Dozen','Pack') NOT NULL,
  `warehouse_location_id` bigint DEFAULT NULL,
  `reorder_level` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sku` (`sku`),
  KEY `fk_products_category` (`category_id`),
  KEY `fk_products_location` (`warehouse_location_id`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `product_categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `products` */

insert  into `products`(`id`,`sku`,`name`,`category_id`,`uom`,`warehouse_location_id`,`reorder_level`,`created_at`,`updated_at`) values 
(13,'abc','Test',NULL,'kg',NULL,0,'2025-11-22 08:28:02',NULL),
(14,'ABC','Test2',NULL,'kg',NULL,0,'2025-11-22 08:28:02',NULL),
(17,'15 pplus','iphone',2,'gal',2,0,'2025-11-22 10:48:21',NULL);

/*Table structure for table `receipt_items` */

DROP TABLE IF EXISTS `receipt_items`;

CREATE TABLE `receipt_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `receipt_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  `qty` decimal(14,4) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_receipt_items_receipt` (`receipt_id`),
  KEY `fk_receipt_items_product` (`product_id`),
  CONSTRAINT `fk_receipt_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `fk_receipt_items_receipt` FOREIGN KEY (`receipt_id`) REFERENCES `receipts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `receipt_items` */

insert  into `receipt_items`(`id`,`receipt_id`,`product_id`,`qty`) values 
(1,1,13,10.0000);

/*Table structure for table `receipts` */

DROP TABLE IF EXISTS `receipts`;

CREATE TABLE `receipts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `vendor_name` varchar(255) NOT NULL,
  `warehouse_id` bigint NOT NULL,
  `document_no` varchar(100) DEFAULT NULL,
  `contact` varchar(255) DEFAULT NULL,
  `remarks` text,
  `status` enum('Draft','Waiting','Ready','Done','Canceled') DEFAULT 'Draft',
  `created_by` bigint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  `confirmed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_receipts_warehouse` (`warehouse_id`),
  KEY `fk_receipts_user` (`created_by`),
  CONSTRAINT `fk_receipts_user` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_receipts_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `receipts` */

insert  into `receipts`(`id`,`vendor_name`,`warehouse_id`,`document_no`,`contact`,`remarks`,`status`,`created_by`,`created_at`,`updated_at`,`confirmed_at`) values 
(1,'hagabva',1,'RCPT-2025-5710','','','Draft',2,'2025-11-22 11:09:12',NULL,NULL);

/*Table structure for table `stock_moves` */

DROP TABLE IF EXISTS `stock_moves`;

CREATE TABLE `stock_moves` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `product_id` bigint NOT NULL,
  `quantity` decimal(14,4) NOT NULL,
  `move_type` enum('receipt','delivery','transfer','adjustment') NOT NULL,
  `from_warehouse_id` bigint DEFAULT NULL,
  `to_warehouse_id` bigint DEFAULT NULL,
  `reference_id` varchar(100) DEFAULT NULL,
  `movement_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` bigint DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_stock_moves_product` (`product_id`),
  KEY `fk_ledger_from` (`from_warehouse_id`),
  KEY `fk_ledger_to` (`to_warehouse_id`),
  CONSTRAINT `fk_ledger_from` FOREIGN KEY (`from_warehouse_id`) REFERENCES `warehouses` (`id`),
  CONSTRAINT `fk_ledger_to` FOREIGN KEY (`to_warehouse_id`) REFERENCES `warehouses` (`id`),
  CONSTRAINT `fk_stock_moves_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `stock_moves` */

/*Table structure for table `stock_snapshot` */

DROP TABLE IF EXISTS `stock_snapshot`;

CREATE TABLE `stock_snapshot` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `product_id` bigint NOT NULL,
  `warehouse_id` bigint NOT NULL,
  `on_hand` decimal(14,4) NOT NULL DEFAULT '0.0000',
  `last_updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `reserved` decimal(14,4) NOT NULL DEFAULT '0.0000',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_snapshot` (`product_id`,`warehouse_id`),
  KEY `fk_snapshot_warehouse` (`warehouse_id`),
  CONSTRAINT `fk_snapshot_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `fk_snapshot_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `stock_snapshot` */

/*Table structure for table `transfer_items` */

DROP TABLE IF EXISTS `transfer_items`;

CREATE TABLE `transfer_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `transfer_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  `qty` decimal(14,4) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_transfer_items_transfer` (`transfer_id`),
  KEY `fk_transfer_items_product` (`product_id`),
  CONSTRAINT `fk_transfer_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `fk_transfer_items_transfer` FOREIGN KEY (`transfer_id`) REFERENCES `transfers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `transfer_items` */

/*Table structure for table `transfers` */

DROP TABLE IF EXISTS `transfers`;

CREATE TABLE `transfers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `warehouse_from` bigint NOT NULL,
  `warehouse_to` bigint NOT NULL,
  `ref_no` varchar(100) DEFAULT NULL,
  `remarks` text,
  `status` varchar(20) DEFAULT 'Draft',
  `created_by` bigint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_transfers_created_by` (`created_by`),
  KEY `fk_transfers_from` (`warehouse_from`),
  KEY `fk_transfers_to` (`warehouse_to`),
  CONSTRAINT `fk_transfers_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_transfers_from` FOREIGN KEY (`warehouse_from`) REFERENCES `warehouses` (`id`),
  CONSTRAINT `fk_transfers_to` FOREIGN KEY (`warehouse_to`) REFERENCES `warehouses` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `transfers` */

/*Table structure for table `users` */

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` varchar(100) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(512) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `role` varchar(20) DEFAULT 'user',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `users` */

insert  into `users`(`id`,`user_id`,`email`,`password_hash`,`created_at`,`role`) values 
(1,'Jaikirat','jaikiratsingh07@gmail.com','$2b$12$.nTjmA7N1TmC3E44i/16VeOyLSjG7yhXYJ8bjbMwkPQbFIlkgacD6','2025-11-22 07:55:12','user'),
(2,'faizan','faizan.saiyad777@gmail.com','$argon2id$v=19$m=65536,t=3,p=4$RgBANw6i8W6LYEh+K8UAYQ$4ytp5MuJuDfkpB+k/vHI+PXa5zFoL6qk36VF2HOTnLQ','2025-11-22 08:02:04','user');

/*Table structure for table `warehouse_locations` */

DROP TABLE IF EXISTS `warehouse_locations`;

CREATE TABLE `warehouse_locations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `code` varchar(50) DEFAULT NULL,
  `warehouse_id` bigint NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_warehouse_locations_warehouse` (`warehouse_id`),
  CONSTRAINT `fk_warehouse_locations_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `warehouse_locations` */

insert  into `warehouse_locations`(`id`,`name`,`code`,`warehouse_id`,`created_at`) values 
(1,'ahm','ahm01',1,'2025-11-22 10:23:33'),
(2,'ahm','ahm33',1,'2025-11-22 10:24:08');

/*Table structure for table `warehouses` */

DROP TABLE IF EXISTS `warehouses`;

CREATE TABLE `warehouses` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `code` varchar(50) DEFAULT NULL,
  `address` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `warehouses` */

insert  into `warehouses`(`id`,`name`,`code`,`address`,`created_at`) values 
(1,'w11','w11','ahmed','2025-11-22 08:34:12');

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
