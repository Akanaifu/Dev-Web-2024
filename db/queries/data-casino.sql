-- Insérer des utilisateurs dans la table User
INSERT INTO `User` (`user_id`, `username`, `name`, `firstname`, `birthdate`, `solde`, `email`, `password`) VALUES
(1, 'Doe1', 'Doe', 'John', '1990-01-01', 100.50, 'john.doe@example.com', '$2a$10$VwYVtW5Pk0KZxfPo4Un2QesjK.TQRr.5toP9tmabUNxBZ2URfeXxm'),
(2, 'Smith1', 'Smith', 'Jane', '1985-05-15', 200.00, 'jane.smith@example.com', '$2a$10$gub9dZPyTSNKimd/a5F5B.a.uWfEoIlwYZZnt4UVZi.T5iqrKVXnq'),
(3, 'Brown1', 'Brown', 'Charlie', '2000-12-25', 50.75, 'charlie.brown@example.com', '$2a$10$5Isw60iVnSgwH3td0eLbQu22fqP7B/W8DabAC/hR5z4uY/JUTQ7Ya'),
(4, 'ben', 'arens', 'benjamin', '1999-02-04', 100000000, 'ben', '$2a$10$mMR.wjGoiYVAMwBx2PKNfe4XQZrhe.EZEYIUzwZHEnp0pmvRpH.zu'),
(5, 'naifu', 'lemaire', 'nathan', '2003-07-30', 50, 'ntm@pd.tg', ' $2b$10$l/PYtX.Q.C1vdA04t.ieZOjgmN8P/8/Bgw09TKyF6wvWYSmvnbeK6');

-- Insérer des sessions de jeu dans la table Games_session
INSERT INTO `Games_session` (`game_session_id`, `name`, `bet_min`, `bet_max`) VALUES
('MA01', 'Slot Machine', '1', '100'), -- MA pour Machine à sous
('PO01', 'Poker', '5', '500'),       -- PO pour Poker
('RO01', 'Roulette', '2', '200'),    -- RO pour Roulette
('BJ01', 'Blackjack', '10', '1000'), -- BJ pour Blackjack
('BA01', 'Baccarat', '20', '2000'),  -- BA pour Baccarat
('MA02', 'Slot Machine', '1', '150'), -- Deuxième session de Machine à sous
('PO02', 'Poker', '10', '1000'),      -- Deuxième session de Poker
('RO02', 'Roulette', '5', '300');     -- Deuxième session de Roulette

-- Insérer des transactions bancaires dans la table Banking_transaction
INSERT INTO `Banking_transaction` (`transaction_id`, `user_id`, `amount_banking`, `transaction_type`, `transaction_status`) VALUES
(1,1, 50.00, 1, 1), -- Dépôt réussi
(2,2, 100.00, 1, 1), -- Dépôt réussi
(3,3, 25.00, 2, 1), -- Retrait réussi
(4,1, 500.00, 1, 0), -- Dépôt échoué
(5,2, 1000.00, 2, 1); -- Retrait réussi


-- Insérer des paris dans la table Bets
INSERT INTO `Bets` (`bet_id`,`user_id`, `game_session_id`, `amount`, `profit`, `bet_status`, `combinaison`) VALUES
(1,1, 'MA01', 10.00, 50.00, 'win', '7,7,7'), -- Machine à sous avec combinaison
(2,2, 'PO01', 20.00, 0.00, 'lose', NULL),    -- Poker sans combinaison
(3,3, 'RO01', 5.00, 15.00, 'win', NULL),     -- Roulette sans combinaison
(4,2, 'BJ01', 100.00, 0.00, 'lose', NULL),   -- Blackjack sans combinaison
(5,1, 'BA01', 200.00, 500.00, 'win', NULL),  -- Baccarat sans combinaison
(6,1, 'MA02', 15.00, 75.00, 'win', '8,8,8'), -- Deuxième session de Machine à sous avec combinaison
(7,2, 'PO02', 50.00, 0.00, 'lose', NULL),    -- Deuxième session de Poker sans combinaison
(8,3, 'RO02', 10.00, 30.00, 'win', NULL);    -- Deuxième session de Roulette sans combinaison

-- Insérer des statistiques dans la table Stats
INSERT INTO `Stats` (`stat_id`,`user_id`, `num_games`, `num_wins`, `timestamp`) VALUES
(1,1, 10, 5, '2025-04-20 10:00:00'),
(2,2, 15, 7, '2025-04-19 15:30:00'),
(3,3, 8, 3, '2025-04-18 20:45:00'),
(4,1, 20, 10, '2025-04-17 12:00:00'),
(5,2, 5, 2, '2025-04-16 18:00:00');