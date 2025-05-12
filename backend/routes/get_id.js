const express = require("express");
const { verifyToken } = require("../middlewares/auth");
const db = require("../config/dbConfig"); // Importer la configuration de la base de données
const router = express.Router();

router.get("/id", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    if (!userId) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    // Requête pour récupérer l'ID de l'utilisateur
    const [rows] = await db.query(
      "SELECT user_id FROM User WHERE user_id = ?",
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(
      "Erreur lors de la récupération de l'ID de l'utilisateur :",
      err
    );
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Nouvelle route pour récupérer les informations de l'utilisateur
router.get("/info", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    if (!userId) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    // Requête pour récupérer les informations de l'utilisateur
    const [rows] = await db.query(
      "SELECT user_id, username, email, solde FROM User WHERE user_id = ?",
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(
      "Erreur lors de la récupération des informations de l'utilisateur :",
      err
    );
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
