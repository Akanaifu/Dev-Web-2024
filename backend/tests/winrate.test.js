const request = require('supertest');
const express = require('express');
const statsRouter = require('../routes/stats');

// Mock de la base de données
jest.mock('../config/dbConfig', () => ({
  query: jest.fn()
}));

const db = require('../config/dbConfig');

const app = express();
app.use(express.json());
app.use('/stats', statsRouter);

describe('GET /stats/:id/winrate', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('doit retourner le winrate par jeu pour un utilisateur', async () => {
    db.query.mockResolvedValueOnce([[
      { game_name: 'Poker', total_wins: 3, total_games: 5, win_rate: 60 },
      { game_name: 'Blackjack', total_wins: 2, total_games: 4, win_rate: 50 }
    ]]);

    const res = await request(app).get('/stats/1/winrate');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([
      { game_name: 'Poker', total_wins: 3, total_games: 5, win_rate: 60 },
      { game_name: 'Blackjack', total_wins: 2, total_games: 4, win_rate: 50 }
    ]);
    expect(db.query).toHaveBeenCalled();
  });

  it('doit gérer les erreurs de base de données', async () => {
    db.query.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).get('/stats/1/winrate');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});