-- Insérer des utilisateurs dans la table User
INSERT INTO `User` (`name`, `firstname`, `birthdate`, `solde`, `email`, `password`) VALUES
('Doe', 'John', '1990-01-01', 100.50, 'john.doe@example.com', 'password123'),
('Smith', 'Jane', '1985-05-15', 200.00, 'jane.smith@example.com', 'securepass'),
('Brown', 'Charlie', '2000-12-25', 50.75, 'charlie.brown@example.com', 'mypassword');

-- Insérer des sessions de jeu dans la table Games_session
INSERT INTO `Games_session` (`name`, `bet_min`, `bet_max`) VALUES
('Slot Machine', '1', '100'),
('Poker', '5', '500'),
('Roulette', '2', '200');

-- Insérer des transactions bancaires dans la table Banking_transaction
INSERT INTO `Banking_transaction` (`user_id`, `amount_banking`, `transaction_type`, `transaction_status`) VALUES
(1, 50.00, 1, 1), -- Dépôt
(2, 100.00, 1, 1), -- Dépôt
(3, 25.00, 2, 1); -- Retrait

-- Insérer des paris dans la table Bets
INSERT INTO `Bets` (`user_id`, `game_session_id`, `amount`, `profit`, `bet_status`, `combinaison`) VALUES
(1, 1, 10.00, 50.00, 'win', '7,7,7'),
(2, 2, 20.00, 0.00, 'lose', '1,2,3'),
(3, 3, 5.00, 15.00, 'win', '4,5,6');

-- Insérer des statistiques dans la table Stats
INSERT INTO `Stats` (`user_id`, `num_games`, `num_wins`, `timestamp`) VALUES
(1, 10, 5, '2025-04-20 10:00:00'),
(2, 15, 7, '2025-04-19 15:30:00'),
(3, 8, 3, '2025-04-18 20:45:00');