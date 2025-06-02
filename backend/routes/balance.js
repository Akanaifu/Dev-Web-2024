const express = require("express");
const db = require("../config/dbConfig"); // Chemin corrigé
const router = express.Router();

// Endpoint pour récupérer la liste des jeux
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM games_session");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération des jeux." });
  }
});

// Endpoint pour récupérer un jeu spécifique par son ID
router.get("/:id", async (req, res) => {
  const gameId = parseInt(req.params.id);
  try {
    const [rows] = await db.query("SELECT * FROM jeux WHERE id = ?", [gameId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Jeu non trouvé" });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération du jeu." });
  }
});

// Ajouter du solde à un utilisateur
router.put("/add", async (req, res) => {
  const { userId, value } = req.body;
  if (!userId || typeof value !== "number") {
    return res.status(400).json({ error: "Paramètres invalides" });
  }
  try {
    // Met à jour le solde
    await db.query("UPDATE users SET solde = solde + ? WHERE id = ?", [value, userId]);
    // Récupère le nouveau solde
    const [rows] = await db.query("SELECT solde FROM users WHERE id = ?", [userId]);
    res.json({ balance: rows[0]?.solde });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de l'ajout de solde." });
  }
});

// Retirer du solde à un utilisateur
router.put("/subtract", async (req, res) => {
  const { userId, value } = req.body;
  if (!userId || typeof value !== "number") {
    return res.status(400).json({ error: "Paramètres invalides" });
  }
  try {
    // Vérifie le solde actuel
    const [rows] = await db.query("SELECT solde FROM users WHERE id = ?", [userId]);
    if (!rows.length) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    const currentBalance = rows[0].solde;
    if (currentBalance < value) {
      return res.status(400).json({ error: "Solde insuffisant" });
    }
    // Met à jour le solde
    await db.query("UPDATE users SET solde = solde - ? WHERE id = ?", [value, userId]);
    // Récupère le nouveau solde
    const [updatedRows] = await db.query("SELECT solde FROM users WHERE id = ?", [userId]);
    res.json({ balance: updatedRows[0]?.solde });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors du retrait de solde." });
  }
});

module.exports = router;
