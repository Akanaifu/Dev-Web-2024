const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const router = express.Router();

// Connexion à la base de données SQLite
const db = new sqlite3.Database('db/casino.db', (err) => {
    if (err) {
        console.error("Erreur lors de la connexion à la base de données:", err.message);
    } else {
        console.log("Connecté à la base de données SQLite.");
    }
});

// Endpoint pour récupérer la liste parties jouées
router.get('/:id', (req, res) => {
    const query = "SELECT * FROM transactions";
    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: "Erreur lors de la récupération des transactions." });
        }
        res.json(rows);
    });
});