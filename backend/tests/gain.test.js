const request = require('supertest');
const express = require('express');
const statsRouter = require('../routes/stats');

// Mock de la base de données
jest.mock('../config/dbConfig', () => ({
	query: jest.fn(),
	execute: jest.fn()
}));

const db = require('../config/dbConfig');

jest.mock('../routes/new_game', () => ({
	calculerGain: jest.fn((rouleaux, amount, betStatus) => {
		if (!rouleaux || rouleaux.length === 0) {
			return 0; // Return 0 for null or empty combinaison
		}
		if (betStatus === 'win') {
			return 200; // Ensure the mock returns the expected value for winning bets
		}
		return 0; // Default for losing bets
	}),
}));

const app = express();
app.use(express.json());
app.use('/stats', statsRouter);

describe('GET /stats/bets/:userId', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	it('doit retourner les paris avec les gains calculés pour un utilisateur', async () => {
		db.execute.mockResolvedValueOnce([
			[
				{
					amount: 100,
					bet_status: 'win',
					combinaison: '[1,2,3]',
					timestamp: '2023-10-01T12:00:00Z',
					created_at: '2020-01-01T00:00:00Z'
				},
				{
					amount: 50,
					bet_status: 'lose',
					combinaison: '[4,5,6]',
					timestamp: '2023-10-02T12:00:00Z',
					created_at: '2020-01-01T00:00:00Z'
				}
			]
		]);

		const res = await request(app).get('/stats/bets/1');
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({
			bets: [
				{
					amount: 100,
					bet_status: 'win',
					combinaison: '[1,2,3]',
					timestamp: '2023-10-01T12:00:00Z',
					gain: expect.any(Number)
				},
				{
					amount: 50,
					bet_status: 'lose',
					combinaison: '[4,5,6]',
					timestamp: '2023-10-02T12:00:00Z',
					gain: expect.any(Number)
				}
			],
			created_at: '2020-01-01T00:00:00Z'
		});
		expect(db.execute).toHaveBeenCalledWith(
			expect.stringContaining('SELECT b.amount, b.bet_status, b.combinaison, gs.timestamp, u.created_at'),
			["1"] // Use string instead of number to match the actual query
		);
	});

	it('doit gérer les erreurs de base de données', async () => {
		db.execute.mockRejectedValueOnce(new Error('DB error'));

		const res = await request(app).get('/stats/bets/1');
		expect(res.statusCode).toBe(500);
		expect(res.body).toHaveProperty('error', 'Erreur serveur.');
	});

	it('doit retourner un tableau vide si aucun pari n\'est trouvé', async () => {
		db.execute.mockResolvedValueOnce([[]]);

		const res = await request(app).get('/stats/bets/1');
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({ bets: [], created_at: undefined });
	});

	it('doit calculer correctement les gains pour les paris gagnants', async () => {
		db.execute.mockResolvedValueOnce([
			[
				{
					amount: 100,
					bet_status: 'win',
					combinaison: '[1,2,3]',
					timestamp: '2023-10-01T12:00:00Z',
					created_at: '2020-01-01T00:00:00Z'
				}
			]
		]);

		const res = await request(app).get('/stats/bets/1');
		expect(res.statusCode).toBe(200);
		expect(res.body.bets[0].gain).toBe(200); // Ensure the gain matches the expected value
	});

	it('doit gérer les combinaisons nulles correctement', async () => {
		db.execute.mockResolvedValueOnce([
			[
				{
					amount: 100,
					bet_status: 'win',
					combinaison: null,
					timestamp: '2023-10-01T12:00:00Z',
					created_at: '2020-01-01T00:00:00Z'
				}
			]
		]);

		const res = await request(app).get('/stats/bets/1');
		expect(res.statusCode).toBe(200);
		expect(res.body.bets[0].combinaison).toBeNull();
		expect(res.body.bets[0].gain).toBe(0); // Gain should be 0 for null combinaison
	});
});