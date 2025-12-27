
DROP DATABASE IF EXISTS `iot_platform`;

CREATE DATABASE `iot_platform`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_0900_ai_ci;

USE `iot_platform`;

-- ================
-- 1) 用户表
-- ================
CREATE TABLE `user` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(64) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('staff','admin') NOT NULL DEFAULT 'staff',
  `email` VARCHAR(255) NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_username` (`username`),
  UNIQUE KEY `uk_user_email` (`email`)
) ENGINE=InnoDB;

-- ================
-- 2) 洁净室表
-- ================
CREATE TABLE `cleanroom` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(128) NOT NULL,
  `meta` JSON NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_cleanroom_name` (`name`)
) ENGINE=InnoDB;

-- ================
-- 3) 网关表
-- ================
CREATE TABLE `gateway` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(128) NOT NULL,
  `sn` VARCHAR(128) NULL,
  `meta` JSON NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `last_seen_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_gateway_name` (`name`),
  UNIQUE KEY `uk_gateway_sn` (`sn`)
) ENGINE=InnoDB;

-- ================
-- 4) 网关-洁净室 关联表（多对多）
-- ================
CREATE TABLE `gateway_cleanroom` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `gateway_id` BIGINT UNSIGNED NOT NULL,
  `cleanroom_id` BIGINT UNSIGNED NOT NULL,
  `meta` JSON NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_gateway_cleanroom` (`gateway_id`, `cleanroom_id`),
  KEY `idx_gc_cleanroom` (`cleanroom_id`),
  KEY `idx_gc_gateway` (`gateway_id`),
  CONSTRAINT `fk_gc_gateway`
    FOREIGN KEY (`gateway_id`) REFERENCES `gateway` (`id`)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_gc_cleanroom`
    FOREIGN KEY (`cleanroom_id`) REFERENCES `cleanroom` (`id`)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- ================
-- 5) 设备表（单设备=单变量）
-- ================
CREATE TABLE `device` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(128) NOT NULL,
  `sn` VARCHAR(128) NULL,
  `type` ENUM('particle','temperature','humidity','diff_pressure','micro_vibration','actuator') NOT NULL,
  `gateway_id` BIGINT UNSIGNED NULL,
  `cleanroom_id` BIGINT UNSIGNED NULL,
  `unit` VARCHAR(32) NULL,
  `meta` JSON NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `last_seen_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_device_sn` (`sn`),
  KEY `idx_device_gateway` (`gateway_id`),
  KEY `idx_device_cleanroom` (`cleanroom_id`),
  KEY `idx_device_type` (`type`),
  CONSTRAINT `fk_device_gateway`
    FOREIGN KEY (`gateway_id`) REFERENCES `gateway` (`id`)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT `fk_device_cleanroom`
    FOREIGN KEY (`cleanroom_id`) REFERENCES `cleanroom` (`id`)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- ================
-- 6) 设备影子（开发初期用不到）
-- ================
CREATE TABLE `device_shadow` (
  `device_id` BIGINT UNSIGNED NOT NULL,
  `desired` JSON NULL,
  `reported` JSON NULL,
  `desired_updated_at` DATETIME NULL,
  `reported_updated_at` DATETIME NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`device_id`),
  CONSTRAINT `fk_shadow_device`
    FOREIGN KEY (`device_id`) REFERENCES `device` (`id`)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- ================
-- 7) 命令下行记录（暂不追踪status）
-- ================
CREATE TABLE `command_log` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `device_id` BIGINT UNSIGNED NOT NULL,
  `issued_by` BIGINT UNSIGNED NULL,
  `command_name` VARCHAR(128) NULL,
  `payload` JSON NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_cmd_device_time` (`device_id`, `created_at`),
  KEY `idx_cmd_user_time` (`issued_by`, `created_at`),
  CONSTRAINT `fk_cmd_device`
    FOREIGN KEY (`device_id`) REFERENCES `device` (`id`)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_cmd_user`
    FOREIGN KEY (`issued_by`) REFERENCES `user` (`id`)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;
