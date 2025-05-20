const express = require("express");
const router = express.Router();
const db = require("../config/dbConfig");

// Fonction utilitaire pour calculer le gain (reprend la logique de firebase.py)
function calculerGain(rouleaux, mise) {
  const [r2, r1, r3] = rouleaux;
  let multiplicateur = 0;
  let presence_event = false;

  if (r1 === r2 && r2 === r3) {
    return r1 === 7 ? 100 : 10;
  }
  if ((r1 + 1 === r3 && r2 + 1 === r1) || (r1 - 1 === r3 && r2 - 1 === r1)) {
    multiplicateur = 5;
    presence_event = true;
  } else if (r1 === r3 && r1 !== r2) {
    multiplicateur = 2;
    presence_event = true;
  }
  if (r1 % 2 === r2 % 2 && r2 % 2 === r3 % 2) {
    multiplicateur = 1.5;
    presence_event = true;
  }
  const count_7 = [r1, r2, r3].filter((v) => v === 7).length;
  multiplicateur += count_7 * 0.5;
  if (!presence_event) {
    if (count_7 === 1) {
      multiplicateur = 0.5;
    } else if (count_7 === 2) {
      multiplicateur = 1;
    }
  }
  return Math.floor(mise * multiplicateur);
}

// Endpoint pour ajouter une nouvelle partie
router.post("/add", async (req, res) => {
  const {
    partieId,
    partieJouee,
    solde,
    combinaison,
    joueurId,
    timestamp,
    partieAffichee,
  } = req.body;

  console.log("Données reçues :", req.body);

  if (
    !partieId ||
    partieJouee === undefined ||
    solde === undefined ||
    !combinaison ||
    !joueurId ||
    !timestamp ||
    partieAffichee === undefined
  ) {
    return res.status(400).json({ error: "Données manquantes ou invalides." });
  }

  try {
    // Générer le prochain game_session_id de la forme MAxx
    const [rows] = await db.execute(
      `SELECT game_session_id FROM Games_session WHERE game_session_id LIKE 'MA%' ORDER BY game_session_id DESC LIMIT 1`
    );
    let nextIndex = 1;
    if (rows.length > 0) {
      const lastId = rows[0].game_session_id;
      const match = lastId.match(/^MA(\d+)$/);
      if (match) {
        nextIndex = parseInt(match[1], 10) + 1;
      }
    }
    const newGameSessionId = `MA${nextIndex.toString().padStart(2, "0")}`;

    // Insérer une nouvelle session de jeu dans Games_session
    const gameSessionQuery = `
      INSERT INTO Games_session (name, bet_min, bet_max)
      VALUES (?, ?, ?)
    `;
    await db.execute(gameSessionQuery, [
      `Game for ${joueurId}`,
      solde, // Valeur par défaut pour bet_min
      solde, // Valeur par défaut pour bet_max
    ]);

    // Récupérer l'ID de la session de jeu nouvellement créée
    const gameSessionId = newGameSessionId;

    // Calculer le gain à partir de la combinaison et de la mise
    // combinaison attendue sous forme d'array de 3 chiffres
    let gain = 0;
    if (Array.isArray(combinaison) && combinaison.length === 3) {
      gain = calculerGain(combinaison.map(Number), Number(solde));
    }

    // Insérer les données dans la table Bets
    const betQuery = `
      INSERT INTO Bets (user_id, game_session_id, amount, bet_status, combinaison)
      VALUES (
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
      gain > 0 ? "win" : "lose",
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
