const express = require("express");
const db = require("../db/config/dbConfig"); // Chemin corrigé
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

module.exports = router;
