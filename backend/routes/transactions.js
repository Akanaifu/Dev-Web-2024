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

// Endpoint pour récupérer la liste des transactions
router.get('/', (req, res) => {
    const query = "SELECT * FROM transactions";
    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: "Erreur lors de la récupération des transactions." });
        }
        res.json(rows);
    });
});

// Endpoint pour récupérer une transaction spécifique par son ID
router.get('/:id', (req, res) => {
    const query = "SELECT * FROM transactions WHERE id = ?";
    const transactionId = parseInt(req.params.id);

    db.get(query, [transactionId], (err, row) => {
        if (err) {
            return res.status(500).json({ error: "Erreur lors de la récupération de la transaction." });
        }
        if (!row) {
            return res.status(404).json({ error: "Transaction non trouvée" });
        }
        res.json(row);
    });
});

module.exports = router;
