const express = require("express");
const { verifyToken } = require("../middlewares/auth");
const db = require("../config/dbConfig");
const router = express.Router();

/**
 * Route API pour mettre à jour le solde d'un utilisateur de manière sécurisée.
 * Cette route utilise l'authentification par token et valide les données avant modification en base.
 */
router.post("/update", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { newSolde } = req.body;

    // Logs d'information pour tracer les demandes de mise à jour de solde
    // Ces console.log permettent de diagnostiquer les problèmes de synchronisation entre frontend et backend
    console.log(`[SOLDE UPDATE] Demande de mise à jour du solde pour l'utilisateur ${userId}`);
    console.log(`[SOLDE UPDATE] Nouveau solde demandé: ${newSolde}`);

        if (!userId) {
      console.log(`[SOLDE UPDATE] Erreur: Utilisateur non trouvé`);
      return res.status(404).json({ error: "Utilisateur non trouvé" });
        }

        // Validation rigoureuse du montant pour éviter les erreurs de base de données
        // Cette vérification empêche l'insertion de valeurs non numériques ou infinies
        if (isNaN(newSolde) || !isFinite(newSolde)) {
      console.log(`[SOLDE UPDATE] Erreur: Valeur de solde invalide - ${newSolde}`);
      return res.status(400).json({ error: "Valeur de solde invalide" });
    }

    // Récupération de l'ancien solde pour comparaison et audit des modifications
    // Cette étape permet de tracer l'évolution du solde pour le débogage
    const [oldSoldeResult] = await db.query(
      "SELECT solde FROM User WHERE user_id = ?",
      [userId]
    );
    
    const oldSolde = oldSoldeResult.length > 0 ? oldSoldeResult[0].solde : 'inconnu';
    console.log(`[SOLDE UPDATE] Ancien solde de l'utilisateur ${userId}: ${oldSolde}`);

    // Exécution de la mise à jour avec logging du résultat pour vérification
    // Les logs confirment que l'opération a bien affecté une ligne en base de données
    const [result] = await db.query(
        "UPDATE User SET solde = ? WHERE user_id = ?",
      [newSolde, userId]
    );

    console.log(`[SOLDE UPDATE] Requête UPDATE exécutée - Lignes affectées: ${result.affectedRows}`);
    console.log(`[SOLDE UPDATE] ✅ Solde mis à jour avec succès pour l'utilisateur ${userId}: ${oldSolde} → ${newSolde}`);
    
    res.json({ success: true, message: "Solde mis à jour avec succès" });
  } catch (err) {
    // Log d'erreur détaillé pour faciliter le débogage en cas de problème
    // Ces informations sont cruciales pour identifier les erreurs de base de données ou de réseau
    console.error(`[SOLDE UPDATE] ❌ Erreur lors de la mise à jour du solde:`, err);
    res.status(500).json({ error: "Erreur serveur" });
}
});

module.exports = router;
