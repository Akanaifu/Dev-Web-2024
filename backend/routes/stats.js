const express = require("express");
const db = require("../db/config/dbConfig"); // Utilisation de MariaDB
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM stats");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération des jeux." });
  }
});
// Endpoint pour récupérer les statistiques d'un utilisateur
router.get("/:id", async (req, res) => {
  const userId = parseInt(req.params.id);
  try {
    const [rows] = await db.query("SELECT * FROM stats WHERE user_id = ?", [
      userId,
    ]);
    res.json(rows);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des statistiques." });
  }
});

module.exports = router;
