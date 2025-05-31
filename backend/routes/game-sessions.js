const express = require("express");
const db = require("../config/dbConfig");
const router = express.Router();

// Endpoint pour récupérer toutes les sessions de jeu disponibles
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM Games_session ORDER BY timestamp DESC");
    res.json(rows);
  } catch (error) {
    console.error("Erreur lors de la récupération des sessions :", error);
    res.status(500).json({ error: "Erreur lors de la récupération des sessions." });
  }
});

// Fonction pour générer le prochain ID de session
async function getNextGameSessionId(gameType = 'SA') {
  console.log('🔢 BACKEND - getNextGameSessionId appelé avec gameType:', gameType);
  
  const [rows] = await db.execute(
    `SELECT game_session_id FROM Games_session WHERE game_session_id LIKE '${gameType}%' ORDER BY game_session_id DESC LIMIT 1`
  );
  
  console.log('🔍 BACKEND - Résultats de la requête:', rows);
  
  let nextIndex = 1;
  if (rows.length > 0) {
    const lastId = rows[0].game_session_id;
    console.log('📊 BACKEND - Dernier ID trouvé:', lastId);
    
    const match = lastId.match(new RegExp(`^${gameType}(\\d+)$`));
    console.log('🧩 BACKEND - Match regex:', match);
    
    if (match) {
      nextIndex = parseInt(match[1], 10) + 1;
      console.log('➕ BACKEND - Index calculé:', nextIndex);
    }
  } else {
    console.log('🆕 BACKEND - Aucun ID existant, index = 1');
  }
  
  const newId = `${gameType}${nextIndex.toString().padStart(2, "0")}`;
  console.log('🎯 BACKEND - Nouvel ID généré:', newId);
  
  return newId;
}

// Endpoint pour créer une nouvelle session de jeu
router.post("/create", async (req, res) => {
  console.log('🔥 BACKEND - POST /create appelé');
  console.log('📨 BACKEND - Body reçu:', req.body);
  
  const { name, bet_min, bet_max, gameType = 'SA' } = req.body;
  console.log('🎮 BACKEND - gameType extrait:', gameType);

  if (!name || bet_min === undefined || bet_min === null || bet_max === undefined || bet_max === null) {
    console.log('❌ BACKEND - Données manquantes');
    return res.status(400).json({ error: "Données manquantes. name, bet_min et bet_max sont requis." });
  }

  try {
    console.log('🆔 BACKEND - Génération ID pour gameType:', gameType);
    const gameSessionId = await getNextGameSessionId(gameType);
    console.log('✅ BACKEND - ID généré:', gameSessionId);
    
    const currentTimestamp = new Date();

    const insertQuery = `
      INSERT INTO Games_session (game_session_id, name, bet_min, bet_max, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `;

    console.log('💾 BACKEND - Insertion en base avec:', {
      gameSessionId,
      name,
      bet_min: bet_min.toString(),
      bet_max: bet_max.toString(),
      timestamp: currentTimestamp
    });

    await db.execute(insertQuery, [
      gameSessionId,
      name,
      bet_min.toString(),
      bet_max.toString(),
      currentTimestamp,
    ]);

    const response = {
      message: "Session créée avec succès",
      session: {
        game_session_id: gameSessionId,
        name,
        bet_min: bet_min.toString(),
        bet_max: bet_max.toString(),
        timestamp: currentTimestamp,
      },
    };
    
    console.log('🎉 BACKEND - Réponse envoyée:', response);
    res.status(201).json(response);
  } catch (error) {
    console.error("❌ BACKEND - Erreur lors de la création de la session :", error);
    res.status(500).json({ error: "Erreur lors de la création de la session." });
  }
});

// Endpoint pour rejoindre une session de jeu existante
router.post("/join", async (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: "sessionId est requis." });
  }

  try {
    const [rows] = await db.execute(
      "SELECT * FROM Games_session WHERE game_session_id = ?",
      [sessionId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Session non trouvée." });
    }

    const session = rows[0];
    res.json({
      message: "Session rejointe avec succès",
      session: session,
    });
  } catch (error) {
    console.error("Erreur lors de la jointure de la session :", error);
    res.status(500).json({ error: "Erreur lors de la jointure de la session." });
  }
});

module.exports = router; 