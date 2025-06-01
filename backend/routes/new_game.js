const express = require("express");
const router = express.Router();
const db = require("../config/dbConfig");

// Fonction utilitaire pour calculer le gain (reprend la logique de firebase.py)
function calculerGain(rouleaux, mise, status = "win") {
  // rouleaux doit être [r1, r2, r3]
  const [r1, r2, r3] = Array.isArray(rouleaux)
    ? rouleaux.map(Number)
    : String(rouleaux).split("").map(Number);
  let multiplicateur = 0;
  let presence_event = false;

  if (r1 === r2 && r2 === r3) {
    return mise * (r1 === 7 ? 100 : 10) - mise;
  }
  // Suite ascendante ou descendante stricte
  if ((r1 + 1 === r2 && r2 + 1 === r3) || (r1 - 1 === r2 && r2 - 1 === r3)) {
    multiplicateur = 5;
    presence_event = true;
  } else if (r1 === r3 && r1 !== r2) {
    multiplicateur = 2;
    presence_event = true;
  }
  // Tous pairs ou tous impairs
  if (r1 % 2 === r2 % 2 && r2 % 2 === r3 % 2) {
    multiplicateur += 1.5;
    presence_event = true;
  }
  const count_7 = [r1, r2, r3].filter((v) => v === 7).length;
  if (!presence_event) {
    if (count_7 === 1) {
      multiplicateur = 0.5;
    } else if (count_7 === 2) {
      multiplicateur = 1;
    }
  }
  let gain = mise * multiplicateur - mise;

  // Empêche le statut "lose" si la combinaison est gagnante (gain > 0)
  if (gain > 0 && status === "lose") {
    status = "win";
  }

  if (status === "lose") {
    gain = -Math.abs(gain);
    return Math.floor(gain);
  }
  return Math.floor(gain);
}

// Fonction utilitaire pour convertir un timestamp Firebase (en secondes) en DATETIME MySQL
function firebaseTimestampToMySQLDatetime(firebaseTimestamp) {
  // Si déjà une chaîne ISO, retourne tel quel
  if (
    typeof firebaseTimestamp === "string" &&
    firebaseTimestamp.includes("-")
  ) {
    return firebaseTimestamp.replace("T", " ").substring(0, 19);
  }
  // Si nombre (ex: 1747922783), convertit en DATETIME
  const ts =
    typeof firebaseTimestamp === "number"
      ? firebaseTimestamp
      : parseInt(firebaseTimestamp, 10);
  if (isNaN(ts)) return null;
  const date = new Date(ts * 1000);
  // Format YYYY-MM-DD HH:MM:SS
  return date.toISOString().replace("T", " ").substring(0, 19);
}

// --- Fonctions utilitaires extraites pour simplifier la route ---

async function sessionExists(mysqlTimestamp) {
  const [existingSession] = await db.execute(
    `SELECT game_session_id FROM Games_session WHERE timestamp = ?`,
    [mysqlTimestamp]
  );
  return existingSession.length > 0;
}

async function getNextGameSessionId() {
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
  return `MA${nextIndex.toString().padStart(2, "0")}`;
}

async function insertGameSession(gameSessionId, mise, mysqlTimestamp) {
  const gameSessionQuery = `
    INSERT INTO Games_session (game_session_id, name, bet_min, bet_max, timestamp)
    VALUES (?, ?, ?, ?, ?)
  `;
  await db.execute(gameSessionQuery, [
    gameSessionId,
    "Slot Machine",
    mise,
    mise,
    mysqlTimestamp,
  ]);
}

async function insertBet(joueurId, gameSessionId, solde, gain, combinaison) {
  const betQuery = `
    INSERT INTO Bets (user_id, game_session_id, amount, bet_status, combinaison)
    VALUES (?, ?, ?, ?, ?)
  `;
  await db.execute(betQuery, [
    joueurId,
    gameSessionId,
    solde,
    gain > 0 ? "win" : "lose",
    combinaison.join(","),
  ]);
}

async function getUserSolde(joueurId) {
  const getSoldeQuery = `SELECT solde FROM User WHERE user_id = ?`;
  const [userResult] = await db.execute(getSoldeQuery, [joueurId]);
  return userResult[0]?.solde || 0;
}

async function updateUserSolde(joueurId, newSolde) {
  const updateSoldeQuery = `UPDATE User SET solde = ? WHERE user_id = ?`;
  await db.execute(updateSoldeQuery, [newSolde, joueurId]);
}

// --- Route principale simplifiée ---

router.post("/add", async (req, res) => {
  const {
    partieId,
    partieJouee,
    solde,
    combinaison,
    joueurId,
    timestamp,
    partieAffichee,
    mise,
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
    const mysqlTimestamp = firebaseTimestampToMySQLDatetime(timestamp);

    if (await sessionExists(mysqlTimestamp)) {
      return res
        .status(409)
        .json({ error: "Une session existe déjà avec ce timestamp." });
    }

    const newGameSessionId = await getNextGameSessionId();
    await insertGameSession(newGameSessionId, mise, mysqlTimestamp);

    const gain = calculerGain(combinaison, mise);
    await insertBet(joueurId, newGameSessionId, solde, gain, combinaison);

    const currentSolde = await getUserSolde(joueurId);
    const updatedSolde = currentSolde + gain;
    await updateUserSolde(joueurId, updatedSolde);

    res.status(201).json({ message: "Partie ajoutée avec succès." });
  } catch (error) {
    console.error("Erreur lors de l'ajout de la partie :", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

module.exports = router; // Export par défaut pour le router
module.exports.calculerGain = calculerGain; // Export séparé pour calculerGain
module.exports.firebaseTimestampToMySQLDatetime =
  firebaseTimestampToMySQLDatetime; // Export pour les tests
