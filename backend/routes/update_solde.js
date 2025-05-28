const express = require("express");
const { verifyToken } = require("../middlewares/auth");
const db = require("../config/dbConfig");
const router = express.Router();

// Route pour mettre à jour le solde d'un utilisateur
router.post("/update", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { newSolde } = req.body;

    console.log(`[SOLDE UPDATE] Demande de mise à jour du solde pour l'utilisateur ${userId}`);
    console.log(`[SOLDE UPDATE] Nouveau solde demandé: ${newSolde}`);

    if (!userId) {
      console.log(`[SOLDE UPDATE] Erreur: Utilisateur non trouvé`);
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    // Validation: s'assurer que newSolde est un nombre valide
    if (isNaN(newSolde) || !isFinite(newSolde)) {
      console.log(`[SOLDE UPDATE] Erreur: Valeur de solde invalide - ${newSolde}`);
      return res.status(400).json({ error: "Valeur de solde invalide" });
    }

    // Récupérer l'ancien solde pour comparaison
    const [oldSoldeResult] = await db.query(
      "SELECT solde FROM user WHERE user_id = ?",
      [userId]
    );
    
    const oldSolde = oldSoldeResult.length > 0 ? oldSoldeResult[0].solde : 'inconnu';
    console.log(`[SOLDE UPDATE] Ancien solde de l'utilisateur ${userId}: ${oldSolde}`);

    // Mettre à jour le solde
    const [result] = await db.query(
      "UPDATE user SET solde = ? WHERE user_id = ?",
      [newSolde, userId]
    );

    console.log(`[SOLDE UPDATE] Requête UPDATE exécutée - Lignes affectées: ${result.affectedRows}`);
    console.log(`[SOLDE UPDATE] ✅ Solde mis à jour avec succès pour l'utilisateur ${userId}: ${oldSolde} → ${newSolde}`);
    
    res.json({ success: true, message: "Solde mis à jour avec succès" });
  } catch (err) {
    console.error(`[SOLDE UPDATE] ❌ Erreur lors de la mise à jour du solde:`, err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
