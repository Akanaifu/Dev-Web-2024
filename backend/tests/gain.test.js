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

describe('GET /stats/:id', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	it('doit retourner les gains et pertes pour un utilisateur', async () => {
		db.query.mockResolvedValueOnce([
			[
				{ created_at: '2023-10-01', gain: 100 },
				{ created_at: '2023-10-02', gain: -50 },
				{ created_at: '2023-10-03', gain: 200 },
				{ created_at: '2023-10-04', gain: -100 }
			]
		]);

		const res = await request(app).get('/stats/1/gains');
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual([
			{ created_at: '2023-10-01', gain: 100 },
			{ created_at: '2023-10-02', gain: -50 },
			{ created_at: '2023-10-03', gain: 200 },
			{ created_at: '2023-10-04', gain: -100 }
		]);
		expect(db.query).toHaveBeenCalledWith(
			'SELECT created_at, gain FROM bets WHERE user_id = ? ORDER BY created_at ASC',
			[1]
		);
	});

	it('doit gérer les erreurs de base de données', async () => {
		const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {}); // Désactive temporairement console.error

		db.query.mockRejectedValueOnce(new Error('DB error'));

		const res = await request(app).get('/stats/1/gains');
		expect(res.statusCode).toBe(500);
		expect(res.body).toHaveProperty('error');

		consoleSpy.mockRestore(); // Restaure console.error après le test
	});
});