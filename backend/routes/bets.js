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

// Endpoint pour récupérer la liste des mise
router.get('/', (req, res) => {
    const query = "SELECT * FROM mise";
    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: "Erreur lors de la récupération des mise." });
        }
        res.json(rows);
    });
});

// Endpoint pour récupérer une mise spécifique par son ID
router.get('/:id', (req, res) => {
    const query = "SELECT * FROM mise WHERE id = ?";
    const betId = parseInt(req.params.id);

    db.get(query, [betId], (err, row) => {
        if (err) {
            return res.status(500).json({ error: "Erreur lors de la récupération de la mise." });
        }
        if (!row) {
            return res.status(404).json({ error: "Mise non trouvée" });
        }
        res.json(row);
    });
});

module.exports = router;
