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

// Endpoint pour récupérer la liste des utilisateurs
router.get('/', (req, res) => {
    const query = "SELECT * FROM utilisateurs";
    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: "Erreur lors de la récupération des utilisateurs." });
        }
        res.json(rows);
    });
});

// Endpoint pour récupérer un utilisateur spécifique par son ID
router.get('/:id', (req, res) => {
    const query = "SELECT * FROM utilisateurs WHERE id = ?";
    const gameId = parseInt(req.params.id);

    db.get(query, [gameId], (err, row) => {
        if (err) {
            return res.status(500).json({ error: "Erreur lors de la récupération de l'utilisateur." });
        }
        if (!row) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }
        res.json(row);
    });
});

// Endpoint pour mettre à jour un utilisateur
router.put('/:id', (req, res) => {
    const query = "UPDATE utilisateurs SET nom = ?, email = ? WHERE id = ?";
    const { nom, email } = req.body;
    const userId = parseInt(req.params.id);

    db.run(query, [nom, email, userId], function (err) {
        if (err) {
            return res.status(500).json({ error: "Erreur lors de la mise à jour de l'utilisateur." });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }
        res.json({ message: "Utilisateur mis à jour avec succès." });
    });
});

// Endpoint pour supprimer un utilisateur
router.delete('/:id', (req, res) => {
    const query = "DELETE FROM utilisateurs WHERE id = ?";
    const userId = parseInt(req.params.id);

    db.run(query, [userId], function (err) {
        if (err) {
            return res.status(500).json({ error: "Erreur lors de la suppression de l'utilisateur." });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }
        res.json({ message: "Utilisateur supprimé avec succès." });
    });
});

module.exports = router;
