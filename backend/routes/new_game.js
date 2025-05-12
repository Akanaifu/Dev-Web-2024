const express = require("express");
const router = express.Router();
const db = require("../config/dbConfig");

// Endpoint pour ajouter une nouvelle partie
router.post("/add", async (req, res) => {
  const {
    partieId,
    partieJouee,
    solde,
    combinaison,
    gain,
    joueurId,
    timestamp,
    partieAffichee,
  } = req.body;

  console.log("Données reçues :", req.body); // Ajoutez ce log pour inspecter les données

  if (
    !partieId ||
    partieJouee === undefined ||
    solde === undefined ||
    !combinaison ||
    gain === undefined ||
    !joueurId ||
    !timestamp ||
    partieAffichee === undefined
  ) {
    return res.status(400).json({ error: "Données manquantes ou invalides." });
  }

  try {
    // Votre logique d'insertion dans la base de données
  } catch (error) {
    console.error("Erreur dans le backend :", error); // Log de l'erreur
    res.status(500).json({ error: "Erreur serveur." });
  }

  try {
    // Insérer une nouvelle session de jeu dans Games_session
    const gameSessionQuery = `
      INSERT INTO Games_session (name, bet_min, bet_max)
      VALUES (?, ?, ?)
    `;
    const [gameSessionResult] = await db.execute(gameSessionQuery, [
      `Game for ${joueurId}`,
      gain, // Valeur par défaut pour bet_min
      gain, // Valeur par défaut pour bet_max
    ]);

    // Récupérer l'ID de la session de jeu nouvellement créée
    const gameSessionId = gameSessionResult.insertId;

    // Insérer les données dans la table Bets
    const betQuery = `
      INSERT INTO Bets (user_id, game_session_id, amount, profit, bet_status, combinaison)
      VALUES (
        ?, 
        ?, 
        ?, 
        ?, 
        ?, 
        ?
      )
    `;
    await db.execute(betQuery, [
      joueurId,
      gameSessionId,
      solde,
      gain,
      gain > solde ? "win" : "lose",
      combinaison.join(","),
    ]);
    // Récupérer le solde actuel du joueur
    const getSoldeQuery = `
SELECT solde FROM User WHERE user_id = ?
`;
    const [userResult] = await db.execute(getSoldeQuery, [joueurId]);
    const currentSolde = userResult[0]?.solde || 0;

    // Mettre à jour le solde du joueur
    const updatedSolde = currentSolde + gain;
    const updateSoldeQuery = `
UPDATE User SET solde = ? WHERE user_id = ?
`;
    await db.execute(updateSoldeQuery, [updatedSolde, joueurId]);
    res.status(201).json({ message: "Partie ajoutée avec succès." });
  } catch (error) {
    console.error("Erreur lors de l'ajout de la partie :", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

module.exports = router;
