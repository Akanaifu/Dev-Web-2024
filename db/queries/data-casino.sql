-- Insérer des utilisateurs dans la table User
INSERT INTO `User` (`user_id`, `username`, `name`, `firstname`, `birthdate`, `solde`, `email`, `password`) VALUES
(1, 'Doe1', 'Doe', 'John', '1990-01-01', 100.50, 'john.doe@example.com', '$2a$10$VwYVtW5Pk0KZxfPo4Un2QesjK.TQRr.5toP9tmabUNxBZ2URfeXxm'),
(2, 'Smith1', 'Smith', 'Jane', '1985-05-15', 200.00, 'jane.smith@example.com', '$2a$10$gub9dZPyTSNKimd/a5F5B.a.uWfEoIlwYZZnt4UVZi.T5iqrKVXnq'),
(3, 'Brown1', 'Brown', 'Charlie', '2000-12-25', 50.75, 'charlie.brown@example.com', '$2a$10$5Isw60iVnSgwH3td0eLbQu22fqP7B/W8DabAC/hR5z4uY/JUTQ7Ya'),
(4, 'ben', 'arens', 'benjamin', '1999-02-04', 100000000, 'ben', '$2a$10$mMR.wjGoiYVAMwBx2PKNfe4XQZrhe.EZEYIUzwZHEnp0pmvRpH.zu'),
(5, 'naifu', 'lemaire', 'nathan', '2003-07-30', 50, 'ntm@pd.tg', '$2b$10$l/PYtX.Q.C1vdA04t.ieZOjgmN8P/8/Bgw09TKyF6wvWYSmvnbeK6');

-- Insérer des sessions de jeu dans la table Games_session
INSERT INTO `Games_session` (`game_session_id`, `name`, `bet_min`, `bet_max`, `timestamp`) VALUES
('MA01', 'Slot Machine', '1', '100', '2025-05-21 15:00:00'),
('MA02', 'Slot Machine', '1', '100', '2025-05-22 15:00:00'),
('MA03', 'Slot Machine', '1', '100', '2025-04-22 15:00:00'),
('MA04', 'Slot Machine', '1', '100', '2025-04-22 15:05:00'),
('MA05', 'Slot Machine', '1', '100', '2025-02-22 15:05:00'),
('MA06', 'Slot Machine', '1', '100', '2025-01-22 15:05:00'),
('MA07', 'Slot Machine', '1', '100', '2025-01-22 15:06:00'),

('PO01', 'Poker', '10', '1000', '2025-05-21 14:00:00'),
('PO02', 'Poker', '10', '1000', '2025-05-22 14:00:00'),
('PO03', 'Poker', '10', '1000', '2025-04-22 15:00:00'),
('PO04', 'Poker', '10', '1000', '2025-02-22 15:00:00'),
('PO05', 'Poker', '10', '1000', '2025-02-22 15:01:00'),
('PO06', 'Poker', '10', '1000', '2025-01-22 15:01:00'),
('PO07', 'Poker', '10', '1000', '2025-01-22 15:02:00'),

('RO01', 'Roulette', '2', '200', '2025-05-21 14:05:00'),
('RO02', 'Roulette', '2', '200', '2025-05-22 14:05:00'),
('RO03', 'Roulette', '2', '200', '2025-04-22 15:01:00'),
('RO04', 'Roulette', '2', '200', '2025-02-22 15:02:00'),
('RO05', 'Roulette', '2', '200', '2025-02-22 15:03:00'),
('RO06', 'Roulette', '2', '200', '2025-01-22 15:03:00'),

('BJ01', 'Blackjack', '10', '1000', '2025-05-21 14:10:00'),
('BJ02', 'Blackjack', '10', '1000', '2025-04-22 15:04:00'),
('BJ03', 'Blackjack', '10', '1000', '2025-02-22 15:05:00'),
('BJ04', 'Blackjack', '10', '1000', '2025-02-22 15:06:00'),
('BJ05', 'Blackjack', '10', '1000', '2025-01-22 15:06:00'),

('BA01', 'Baccarat', '20', '2000', '2025-05-22 14:15:00'),
('BA02', 'Baccarat', '20', '2000', '2025-04-22 15:04:00'),
('BA03', 'Baccarat', '20', '2000', '2025-02-22 15:07:00'),
('BA04', 'Baccarat', '20', '2000', '2025-01-22 15:07:00'),
('BA05', 'Baccarat', '20', '2000', '2025-01-22 15:08:00');






-- Insérer des transactions bancaires dans la table Banking_transaction
INSERT INTO `Banking_transaction` (`transaction_id`, `user_id`, `amount_banking`, `transaction_type`, `transaction_status`) VALUES
(1,1, 50.00, 1, 1), -- Dépôt réussi
(2,2, 100.00, 1, 1), -- Dépôt réussi
(3,3, 25.00, 2, 1), -- Retrait réussi
(4,1, 500.00, 1, 0), -- Dépôt échoué
(5,2, 1000.00, 2, 1); -- Retrait réussi


-- Insérer des paris dans la table Bets
INSERT INTO `Bets` (`bet_id`, `user_id`, `game_session_id`, `amount`, `bet_status`, `combinaison`, `timestamp`) VALUES
(1,1, 'MA01', 10.00, 'win', '7,7,7', '2025-05-21 15:06:03'),     -- Machine à sous avec combinaison
(2,2, 'PO01', 20.00, 'lose', NULL, '2025-05-21 15:06:03'),       -- Poker sans combinaison
(3,3, 'RO01', 5.00, 'win', NULL, '2025-05-21 15:06:03'),         -- Roulette sans combinaison
(4,2, 'BJ01', 100.00, 'lose', NULL, '2025-05-21 15:06:03'),      -- Blackjack sans combinaison
(5,1, 'BA01', 200.00, 'win', NULL, '2025-05-22 15:06:03'),       -- Baccarat sans combinaison
(6,1, 'MA02', 15.00, 'win', '8,8,8', '2025-05-22 15:06:03'),     -- Deuxième session de Machine à sous avec combinaison
(7,2, 'PO02', 50.00, 'lose', NULL, '2025-05-22 15:06:03'),       -- Deuxième session de Poker sans combinaison
(8,3, 'RO02', 10.00, 'win', NULL, '2025-04-22 15:06:03'),        -- Deuxième session de Roulette sans combinaison
(9,2, 'MA03', 5.00, 'lose', NULL, '2025-04-22 15:06:03'),        -- Machine à sous sans combinaison
(10,2, 'PO03', 25.00, 'lose', NULL, '2025-04-22 15:06:03'),      -- Poker sans combinaison
(11,2, 'RO03', 2.00, 'lose', NULL, '2025-04-22 15:06:03'),       -- Roulette sans combinaison
(12,2, 'BJ02', 10.00, 'lose', NULL, '2025-04-22 15:06:03'),      -- Blackjack sans combinaison
(13,2, 'BA02', 20.00, 'lose', NULL, '2025-04-22 15:06:03'),      -- Baccarat sans combinaison
(14,2, 'MA04', 30.00, 'lose', NULL, '2025-04-22 15:06:03'),      -- Deuxième session de Machine à sous sans combinaison
(15,2, 'PO04', 40.00, 'win', NULL, '2025-02-22 15:06:03'),       -- Deuxième session
(16,2, 'RO04', 15.00, 'lose', NULL, '2025-02-22 15:06:03'),      -- Deuxième session de Roulette sans combinaison
(17,2, 'BJ03', 5.00, 'lose', NULL, '2025-02-22 15:06:03'),       -- Deuxième session
(18,2, 'BA03', 10.00, 'win', NULL, '2025-02-22 15:06:03'),       -- Deuxième session
(19,2, 'MA05', 50.00, 'lose', NULL, '2025-02-22 15:06:03'),      -- Machine à sous sans combinaison
(20,2, 'PO05', 100.00, 'lose', NULL, '2025-02-22 15:06:03'),     -- Poker sans combinaison
(21,2, 'RO05', 25.00, 'win', NULL, '2025-02-22 15:06:03'),       -- Roulette sans combinaison
(22,2, 'BJ04', 15.00, 'lose', NULL, '2025-02-22 15:06:03'),      -- Blackjack sans combinaison
(23,2, 'BA04', 5.00, 'lose', NULL, '2025-01-22 15:06:03'),       -- Baccarat sans combinaison
(24,2, 'MA06', 10.00, 'win', NULL, '2025-01-22 15:06:03'),       -- Deuxième session de Machine à sous sans combinaison
(25,2, 'PO06', 20.00, 'lose', NULL, '2025-01-22 15:06:03'),      -- Deuxième session de Poker sans combinaison
(26,2, 'RO06', 50.00, 'lose', NULL, '2025-01-22 15:06:03'),      -- Deuxième session de Roulette sans combinaison
(27,2, 'BJ05', 30.00, 'lose', NULL, '2025-01-22 15:06:03'),      -- Deuxième session
(28,2, 'BA05', 15.00, 'win', NULL, '2025-01-22 15:06:03'),       -- Deuxième session
(29,2, 'MA07', 100.00, 'win', NULL, '2025-01-22 15:06:03'),      -- Machine à sous sans combinaison
(30,2, 'PO07', 200.00, 'win', NULL, '2025-01-22 15:06:03');      -- Poker sans combinaison


-- Insérer des statistiques dans la table Stats
INSERT INTO `Stats` (`stat_id`,`user_id`, `num_games`, `num_wins`, `timestamp`) VALUES
(1,1, 1, 1, '2025-04-20 10:00:00'),
(2,2, 15, 7, '2025-04-19 15:30:00'),
(3,3, 2, 2, '2025-04-18 20:45:00'),
(4,1, 2, 2, '2025-04-17 12:00:00'),
(5,2, 5, 2, '2025-04-16 18:00:00'),
(6,2, 5, 0, '2025-04-17 18:00:00');
