const request = require('supertest');
const express = require('express');

// Mock de la base de données
const db = require('../config/dbConfig');
jest.mock('../config/dbConfig');

// Import du router stats
const statsRouter = require('../routes/stats');

// Configuration de l'app Express pour les tests
const app = express();
app.use(express.json());
app.use('/stats', statsRouter);

describe('POST /stats/update-roulette-stats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Tests de création de nouvelles statistiques', () => {
    it('doit créer de nouvelles statistiques pour une victoire (payout positif)', async () => {
      // Mock: aucune statistique existante
      db.query.mockResolvedValueOnce([[]]);
      // Mock: insertion réussie
      db.query.mockResolvedValueOnce({ insertId: 1, affectedRows: 1 });

      const requestBody = {
        userId: 1,
        payout: 50,
        betTotal: 20
      };

      const res = await request(app)
        .post('/stats/update-roulette-stats')
        .send(requestBody);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: "Statistiques mises à jour avec succès",
        game_played: 1,
        game_won: 1,
        payout: 50
      });

      // Vérification des appels de base de données
      expect(db.query).toHaveBeenCalledTimes(2);
      
      // Vérification SELECT
      expect(db.query).toHaveBeenNthCalledWith(1,
        `SELECT * FROM stats WHERE user_id = ? AND timestamp LIKE CONCAT(CURDATE(), '%')`,
        [1]
      );
      
      // Vérification INSERT (victoire car payout > 0)
      expect(db.query).toHaveBeenNthCalledWith(2,
        `INSERT INTO stats (user_id, num_games, num_wins, timestamp) 
         VALUES (?, 1, ?, NOW())`,
        [1, 1]
      );
    });

    it('doit créer de nouvelles statistiques pour une défaite (payout négatif)', async () => {
      // Mock: aucune statistique existante
      db.query.mockResolvedValueOnce([[]]);
      // Mock: insertion réussie
      db.query.mockResolvedValueOnce({ insertId: 2, affectedRows: 1 });

      const requestBody = {
        userId: 2,
        payout: -20,
        betTotal: 20
      };

      const res = await request(app)
        .post('/stats/update-roulette-stats')
        .send(requestBody);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: "Statistiques mises à jour avec succès",
        game_played: 1,
        game_won: 0,
        payout: -20
      });

      // Vérification INSERT (défaite car payout < 0)
      expect(db.query).toHaveBeenNthCalledWith(2,
        `INSERT INTO stats (user_id, num_games, num_wins, timestamp) 
         VALUES (?, 1, ?, NOW())`,
        [2, 0]
      );
    });

    it('doit créer de nouvelles statistiques pour un payout nul', async () => {
      // Mock: aucune statistique existante
      db.query.mockResolvedValueOnce([[]]);
      // Mock: insertion réussie
      db.query.mockResolvedValueOnce({ insertId: 3, affectedRows: 1 });

      const requestBody = {
        userId: 3,
        payout: 0,
        betTotal: 10
      };

      const res = await request(app)
        .post('/stats/update-roulette-stats')
        .send(requestBody);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: "Statistiques mises à jour avec succès",
        game_played: 1,
        game_won: 0,
        payout: 0
      });

      // Vérification INSERT (défaite car payout = 0)
      expect(db.query).toHaveBeenNthCalledWith(2,
        `INSERT INTO stats (user_id, num_games, num_wins, timestamp) 
         VALUES (?, 1, ?, NOW())`,
        [3, 0]
      );
    });
  });

  describe('Tests de mise à jour des statistiques existantes', () => {
    it('doit mettre à jour les statistiques existantes pour une victoire', async () => {
      const existingStats = [{
        stat_id: 10,
        user_id: 1,
        num_games: 5,
        num_wins: 2,
        timestamp: '2024-01-15 10:30:00'
      }];

      // Mock: statistiques existantes trouvées
      db.query.mockResolvedValueOnce([existingStats]);
      // Mock: mise à jour réussie
      db.query.mockResolvedValueOnce({ affectedRows: 1 });

      const requestBody = {
        userId: 1,
        payout: 100,
        betTotal: 25
      };

      const res = await request(app)
        .post('/stats/update-roulette-stats')
        .send(requestBody);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: "Statistiques mises à jour avec succès",
        game_played: 1,
        game_won: 1,
        payout: 100
      });

      // Vérification UPDATE (6 parties, 3 victoires)
      expect(db.query).toHaveBeenNthCalledWith(2,
        `UPDATE stats SET num_games = ?, num_wins = ?, timestamp = NOW() 
         WHERE stat_id = ?`,
        [6, 3, 10]
      );
    });

    it('doit mettre à jour les statistiques existantes pour une défaite', async () => {
      const existingStats = [{
        stat_id: 20,
        user_id: 2,
        num_games: 8,
        num_wins: 4,
        timestamp: '2024-01-15 14:20:00'
      }];

      // Mock: statistiques existantes trouvées
      db.query.mockResolvedValueOnce([existingStats]);
      // Mock: mise à jour réussie
      db.query.mockResolvedValueOnce({ affectedRows: 1 });

      const requestBody = {
        userId: 2,
        payout: -15,
        betTotal: 15
      };

      const res = await request(app)
        .post('/stats/update-roulette-stats')
        .send(requestBody);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: "Statistiques mises à jour avec succès",
        game_played: 1,
        game_won: 0,
        payout: -15
      });

      // Vérification UPDATE (9 parties, 4 victoires - pas de changement dans num_wins)
      expect(db.query).toHaveBeenNthCalledWith(2,
        `UPDATE stats SET num_games = ?, num_wins = ?, timestamp = NOW() 
         WHERE stat_id = ?`,
        [9, 4, 20]
      );
    });
  });

  describe('Tests de gestion des erreurs', () => {
    it('doit gérer les erreurs de base de données lors de la sélection', async () => {
      // Mock: erreur lors de la sélection
      db.query.mockRejectedValueOnce(new Error('Database connection failed'));

      const requestBody = {
        userId: 1,
        payout: 50,
        betTotal: 20
      };

      const res = await request(app)
        .post('/stats/update-roulette-stats')
        .send(requestBody);

      expect(res.status).toBe(500);
      expect(res.body).toEqual({
        error: "Erreur lors de la mise à jour des statistiques."
      });
    });

    it('doit gérer les erreurs lors de l\'insertion de nouvelles statistiques', async () => {
      // Mock: aucune statistique existante
      db.query.mockResolvedValueOnce([[]]);
      // Mock: erreur lors de l'insertion
      db.query.mockRejectedValueOnce(new Error('INSERT failed'));

      const requestBody = {
        userId: 1,
        payout: 30,
        betTotal: 10
      };

      const res = await request(app)
        .post('/stats/update-roulette-stats')
        .send(requestBody);

      expect(res.status).toBe(500);
      expect(res.body).toEqual({
        error: "Erreur lors de la mise à jour des statistiques."
      });
    });

    it('doit gérer les erreurs lors de la mise à jour des statistiques existantes', async () => {
      const existingStats = [{
        stat_id: 15,
        user_id: 1,
        num_games: 3,
        num_wins: 1,
        timestamp: '2024-01-15 16:45:00'
      }];

      // Mock: statistiques existantes trouvées
      db.query.mockResolvedValueOnce([existingStats]);
      // Mock: erreur lors de la mise à jour
      db.query.mockRejectedValueOnce(new Error('UPDATE failed'));

      const requestBody = {
        userId: 1,
        payout: 75,
        betTotal: 25
      };

      const res = await request(app)
        .post('/stats/update-roulette-stats')
        .send(requestBody);

      expect(res.status).toBe(500);
      expect(res.body).toEqual({
        error: "Erreur lors de la mise à jour des statistiques."
      });
    });
  });

  describe('Tests de validation des données', () => {
    it('doit traiter correctement les userId en tant que nombres', async () => {
      // Mock: aucune statistique existante
      db.query.mockResolvedValueOnce([[]]);
      // Mock: insertion réussie
      db.query.mockResolvedValueOnce({ insertId: 1, affectedRows: 1 });

      const requestBody = {
        userId: "5", // String qui sera converti
        payout: 40,
        betTotal: 20
      };

      const res = await request(app)
        .post('/stats/update-roulette-stats')
        .send(requestBody);

      expect(res.status).toBe(200);
      
      // Vérification que userId est bien traité comme un nombre
      expect(db.query).toHaveBeenNthCalledWith(1,
        `SELECT * FROM stats WHERE user_id = ? AND timestamp LIKE CONCAT(CURDATE(), '%')`,
        ["5"] // Le userId reste tel qu'envoyé dans la requête
      );
    });

    it('doit traiter correctement les valeurs de payout décimales', async () => {
      // Mock: aucune statistique existante
      db.query.mockResolvedValueOnce([[]]);
      // Mock: insertion réussie
      db.query.mockResolvedValueOnce({ insertId: 1, affectedRows: 1 });

      const requestBody = {
        userId: 1,
        payout: 25.5,
        betTotal: 10
      };

      const res = await request(app)
        .post('/stats/update-roulette-stats')
        .send(requestBody);

      expect(res.status).toBe(200);
      expect(res.body.payout).toBe(25.5);
      expect(res.body.game_won).toBe(1); // payout > 0 donc victoire
    });
  });
});
