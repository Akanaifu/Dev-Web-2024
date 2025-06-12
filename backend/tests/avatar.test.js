const request = require('supertest');
const express = require('express');
const fs = require('fs');
const path = require('path');
const uploadAvatarRouter = require('../routes/upload-avatar');

// Mock de la base de données
jest.mock('../config/dbConfig', () => ({
  execute: jest.fn().mockResolvedValue([{}])
}));

const app = express();
app.use(express.json());
app.use('/avatar', uploadAvatarRouter);

describe('Avatar upload et récupération', () => {
  const testImagePath = path.join(__dirname, 'test-image.png');
  const outputPath = path.join(__dirname, '../assets/123.png');
  const avatarPath = path.join(__dirname, '../assets/456.png');
  const defaultPath = path.join(__dirname, '../assets/default.png');

  beforeAll(() => {
    // Place ici la création d'un vrai PNG si besoin, ou assure-toi que test-image.png existe
    // Pour les tests GET, assure-toi que 456.png et default.png existent
    if (!fs.existsSync(avatarPath)) {
      fs.copyFileSync(testImagePath, avatarPath);
    }
    if (!fs.existsSync(defaultPath)) {
      fs.copyFileSync(testImagePath, defaultPath);
    }
  });

  afterAll(() => {
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    if (fs.existsSync(avatarPath)) fs.unlinkSync(avatarPath);
    // Ne supprime pas default.png si déjà existant
  });

  // Tests POST (upload)
  describe('POST /avatar/upload-avatar', () => {
    it('doit uploader, redimensionner et enregistrer un avatar', async () => {
      const res = await request(app)
        .post('/avatar/upload-avatar')
        .field('userId', '123')
        .attach('avatar', testImagePath);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message');
      expect(fs.existsSync(outputPath)).toBe(true);
    });

    it('doit retourner une erreur si aucun fichier', async () => {
      const res = await request(app)
        .post('/avatar/upload-avatar')
        .field('userId', '123');
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('doit retourner une erreur si userId manquant', async () => {
      const res = await request(app)
        .post('/avatar/upload-avatar')
        .attach('avatar', testImagePath);
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  // Tests GET (affichage)
  describe('GET /avatar/:id', () => {
    it('doit retourner le fichier avatar si existant', async () => {
      const res = await request(app).get('/avatar/456');
      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toMatch(/image\/png/);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('doit retourner le fichier par défaut si avatar inexistant', async () => {
      const res = await request(app).get('/avatar/99999');
      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toMatch(/image\/png/);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });
});