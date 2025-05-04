const express = require("express");
const db = require("../config/dbConfig"); // Chemin corrigé
const router = express.Router();

// Endpoint pour récupérer la liste des mises
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM bets");
    res.json(rows);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des mises." });
  }
});

// Endpoint pour récupérer une mise spécifique par son ID
router.get("/:id", async (req, res) => {
  const betId = parseInt(req.params.id);
  try {
    const [rows] = await db.query("SELECT * FROM mise WHERE id = ?", [betId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Mise non trouvée" });
    }
    res.json(rows[0]);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération de la mise." });
  }
});

module.exports = router;
