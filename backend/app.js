const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Connexion à la base SQLite
const db = new sqlite3.Database('db/casino.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connecté à la base SQLite.');
    }
});

// Route pour la page de base
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route pour récupérer tous les utilisateurs
app.get('/utilisateurs', (req, res) => {
    db.all('SELECT * FROM utilisateurs', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Route pour récupérer tous les jeux
app.get('/jeux', (req, res) => {
    db.all('SELECT * FROM jeux', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});