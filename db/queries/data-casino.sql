-- Insérer des utilisateurs dans la table User
INSERT INTO `User` (`user_id`, `username`, `name`, `firstname`, `birthdate`, `solde`, `email`, `password`, `avatar`) VALUES
(1, 'Doe1', 'Doe', 'John', '1990-01-01', 100.50, 'john.doe@example.com', '$2a$10$VwYVtW5Pk0KZxfPo4Un2QesjK.TQRr.5toP9tmabUNxBZ2URfeXxm', NULL),
(2, 'Smith1', 'Smith', 'Jane', '1985-05-15', 200.00, 'jane.smith@example.com', '$2a$10$gub9dZPyTSNKimd/a5F5B.a.uWfEoIlwYZZnt4UVZi.T5iqrKVXnq','2.jpg'),
(3, 'Brown1', 'Brown', 'Charlie', '2000-12-25', 50.75, 'charlie.brown@example.com', '$2a$10$5Isw60iVnSgwH3td0eLbQu22fqP7B/W8DabAC/hR5z4uY/JUTQ7Ya', NULL),
(4, 'ben', 'arens', 'benjamin', '1999-02-04', 100000000, 'ben', '$2a$10$mMR.wjGoiYVAMwBx2PKNfe4XQZrhe.EZEYIUzwZHEnp0pmvRpH.zu', NULL),
(5, 'naifu', 'lemaire', 'nathan', '2003-07-30', 50, 'ntm@pd.tg', '$2b$10$l/PYtX.Q.C1vdA04t.ieZOjgmN8P/8/Bgw09TKyF6wvWYSmvnbeK6', NULL),
(6,'antoine','antoine','antoine','2025-05-27',100000000,'antoine.antoine@gmail.com','$2b$10$rdFgF81xOMqA5ms.DCm9vuleMamxEqDfrr9a0xhzRDzFDidFq1sT.', NULL);

-- Insérer des sessions de jeu dans la table Games_session
INSERT INTO `Games_session` (`game_session_id`, `name`, `bet_min`, `bet_max`, `timestamp`) VALUES
('PO01', 'Poker', '5', '500', '2025-04-20 10:00:00'),       -- PO pour Poker
('RO01', 'Roulette', '2', '200', '2025-04-19 15:30:00'),    -- RO pour Roulette
('BJ01', 'Blackjack', '10', '1000', '2025-04-18 20:45:00'), -- BJ pour Blackjack
('BA01', 'Baccarat', '20', '2000', '2025-04-17 12:00:00'),  -- BA pour Baccarat
('PO02', 'Poker', '10', '1000', '2025-04-16 18:00:00'),     -- Deuxième session de Poker
('RO02', 'Roulette', '5', '300', '2025-04-15 14:00:00'),    -- Deuxième session de Roulette
('RO06', 'Roulette', '1', '900000', '2025-04-19 15:30:00');    -- RO pour Roulette

-- Insérer des transactions bancaires dans la table Banking_transaction
INSERT INTO `Banking_transaction` (`transaction_id`, `user_id`, `amount_banking`, `transaction_type`, `transaction_status`) VALUES
(1,1, 50.00, 1, 1), -- Dépôt réussi
(2,2, 100.00, 1, 1), -- Dépôt réussi
(3,3, 25.00, 2, 1), -- Retrait réussi
(4,1, 500.00, 1, 0), -- Dépôt échoué
(5,2, 1000.00, 2, 1), -- Retrait réussi
(6,6, 25.00, 2, 1);

-- Insérer des paris dans la table Bets
INSERT INTO `Bets` (`bet_id`, `user_id`, `game_session_id`, `amount`, `bet_status`, `combinaison`) VALUES
(2,2, 'PO01', 20.00, 'lose', NULL),       -- Poker sans combinaison
(3,3, 'RO01', 5.00, 'win', NULL),         -- Roulette sans combinaison
(4,2, 'BJ01', 100.00, 'lose', NULL),      -- Blackjack sans combinaison
(5,1, 'BA01', 200.00, 'win', NULL),       -- Baccarat sans combinaison
(7,2, 'PO02', 50.00, 'lose', NULL),       -- Deuxième session de Poker sans combinaison
(8,3, 'RO02', 10.00, 'win', NULL),       -- Deuxième session de Roulette sans combinaison
(9,6, 'RO06', 10.00, 'win', NULL); 

-- Insérer des statistiques dans la table Stats
INSERT INTO `Stats` (`stat_id`,`user_id`, `num_games`, `num_wins`, `timestamp`) VALUES
(1,1, 1, 1, '2025-04-20 10:00:00'),
(2,2, 15, 7, '2025-04-19 15:30:00'),
(3,3, 2, 2, '2025-04-18 20:45:00'),
(4,1, 2, 2, '2025-04-17 12:00:00'),
(5,2, 5, 2, '2025-04-16 18:00:00'),
(6,2, 5, 0, '2025-04-17 18:00:00'),
(7,6, 5, 6, '2025-04-17 18:00:00');