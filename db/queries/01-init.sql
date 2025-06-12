CREATE DATABASE IF NOT EXISTS casino;

CREATE USER IF NOT EXISTS 'dev'@'%' IDENTIFIED BY 'casino';
GRANT ALL PRIVILEGES ON casino.* TO 'dev'@'%';
FLUSH PRIVILEGES;


USE casino;

CREATE TABLE `User` (
  `user_id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NULL,
  `name` VARCHAR(50) NULL DEFAULT 'no_name',
  `firstname` VARCHAR(50) NULL DEFAULT 'no_first_name',
  `birthdate` DATETIME NULL,
  `solde` FLOAT NOT NULL DEFAULT '0',
  `email` VARCHAR(50) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `avatar` VARCHAR(255) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`)
) COLLATE='utf8mb4_uca1400_ai_ci';

CREATE TABLE `Games_session` (
  `game_session_id` varchar(15) NOT NULL ,
  `name` VARCHAR(50) NOT NULL DEFAULT '',
  `bet_min` VARCHAR(50) NOT NULL DEFAULT '',
  `bet_max` VARCHAR(50) NOT NULL DEFAULT '',
  `timestamp` DATETIME NULL,
  PRIMARY KEY (`game_session_id`)
) COLLATE='utf8mb4_uca1400_ai_ci';

CREATE TABLE `Banking_transaction` (
  `transaction_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NULL DEFAULT 0,
  `amount_banking` FLOAT NOT NULL DEFAULT 0,
  `transaction_type` FLOAT NOT NULL DEFAULT 0,
  `transaction_status` FLOAT NOT NULL DEFAULT 0,
  PRIMARY KEY (`transaction_id`),
  FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`)
) COLLATE='utf8mb4_uca1400_ai_ci';

CREATE TABLE `Bets` (
  `bet_id` INT NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL DEFAULT 0,
  `game_session_id` varchar(15) NOT NULL DEFAULT '0',
  `amount` FLOAT NOT NULL DEFAULT 0,
  `bet_status` VARCHAR(50) NOT NULL DEFAULT '0',
  `combinaison` VARCHAR(11) NULL DEFAULT '000',
  PRIMARY KEY (`bet_id`),
  FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`),
  FOREIGN KEY (`game_session_id`) REFERENCES `Games_session`(`game_session_id`)
) COLLATE='utf8mb4_uca1400_ai_ci';

CREATE TABLE `Stats` (
  `stat_id` INT NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `num_games` INT NOT NULL DEFAULT '0',
  `num_wins` INT NOT NULL DEFAULT '0',
  `timestamp` VARCHAR(50) NOT NULL DEFAULT '0',
  PRIMARY KEY (`stat_id`),
  FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`)
) COLLATE='utf8mb4_uca1400_ai_ci';