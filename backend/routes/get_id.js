const express = require("express");
const { verifyToken } = require("../middlewares/auth");
const router = express.Router();

// Route pour récupérer l'ID du joueur connecté
router.get("/id", verifyToken, (req, res) => {
  try {
    // L'ID de l'utilisateur est attaché à la requête par le middleware verifyToken
    const userId = req.user.userId;

    if (!userId) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    res.json({ playerId: userId });
  } catch (err) {
    console.error("Erreur lors de la récupération de l'ID du joueur :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
