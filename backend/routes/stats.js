const express = require("express");
const db = require("../config/dbConfig"); // Utilisation de MariaDB
const router = express.Router();
const { calculerGain } = require("./new_game"); // Assurez-vous que le chemin est correct

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

// Route pour récupérer le win rate par jeu pour un utilisateur spécifique
// http://localhost:3000/stats/:id/winrate
router.get("/:id/winrate", async (req, res) => {
  const userId = parseInt(req.params.id);
  try {
    const query = `
      SELECT gs.name AS game_name,
             CAST(SUM(CASE WHEN b.bet_status = 'win' THEN 1 ELSE 0 END) AS UNSIGNED) AS total_wins,
             COUNT(*) AS total_games,
             CAST(ROUND(SUM(CASE WHEN b.bet_status = 'win' THEN 1 ELSE 0 END) / COUNT(*), 2) * 100 AS DECIMAL(5,2)) AS win_rate
      FROM bets b
      JOIN games_session gs ON b.game_session_id = gs.game_session_id
      WHERE b.user_id = ?
      GROUP BY gs.name;
    `;
    const [rows] = await db.query(query, [userId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération du win rate." });
  }
});

// Route pour récupérer le nombre de partie joué par utilisateur
//http://localhost:3000/stats/:id/numberOfGame
// router.get("/:id/numberOfGame", async (req, res) => {
//   const userId = parseInt(req.params.id);
//   try {
//     const query = `
//       SELECT sum(num_games) 'nombre de partie', SUM(num_wins) AS 'nombre de victoire'
//       FROM stats
//       WHERE user_id = ?
//     `;
//     const [rows] = await db.query(query, [userId]);
//     res.json(rows);
//   } catch (err) {
//     res.status(500).json({ error: "Erreur lors de la récupération du win rate." });
//   }
// });

router.get("/bets/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const query = `
      SELECT amount, bet_status, combinaison, timestamp 
      FROM Bets 
      WHERE user_id = ?
    `;
    const [rows] = await db.execute(query, [userId]);

    // Passe chaque combinaison et mise dans la fonction calculerGain
    const results = rows.map((row) => {
      const rouleaux = row.combinaison.split(",").map(Number); // Convertir la combinaison en tableau de nombres
      const gain = calculerGain(rouleaux, row.amount, row.bet_status); // Appel avec bet_status
      return { ...row, gain };
    });

    res.status(200).json(results);
  } catch (error) {
    console.error("Erreur lors de la récupération des paris :", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// Route pour mettre à jour les statistiques après une partie de roulette
// pas utilisée actuellement mais dans le futur
router.post("/update-roulette-stats", async (req, res) => {
  const { userId, payout, betTotal } = req.body;
  
  // console.log(`[STATS UPDATE] 🎯 Début mise à jour stats roulette`);
  // console.log(`[STATS UPDATE] UserId: ${userId}, Payout: ${payout}, BetTotal: ${betTotal}`);
  
  try {
    // Détermine si c'est une victoire (payout positif)
    const isWin = payout > 0;
    // console.log(`[STATS UPDATE] 🎲 Résultat: ${isWin ? 'VICTOIRE' : 'DÉFAITE'} (payout: ${payout})`);
    
    // Vérifie s'il existe déjà des statistiques pour cet utilisateur et la roulette
    // console.log(`[STATS UPDATE] 🔍 Recherche stats existantes pour aujourd'hui...`);
    const [existingStats] = await db.query(
      `SELECT * FROM stats WHERE user_id = ? AND timestamp LIKE CONCAT(CURDATE(), '%')`,
      [userId]
    );
    
    // console.log(`[STATS UPDATE] 📊 Stats trouvées: ${existingStats.length} entrées`);
    
    if (existingStats.length > 0) {
      // Met à jour les statistiques existantes pour aujourd'hui
      const currentStats = existingStats[0];
      const newNumGames = currentStats.num_games + 1;
      const newNumWins = currentStats.num_wins + (isWin ? 1 : 0);
      
      // console.log(`[STATS UPDATE] 🔄 UPDATE - Anciens: ${currentStats.num_games} parties, ${currentStats.num_wins} victoires`);
      // console.log(`[STATS UPDATE] 🔄 UPDATE - Nouveaux: ${newNumGames} parties, ${newNumWins} victoires`);
      
      await db.query(
        `UPDATE stats SET num_games = ?, num_wins = ?, timestamp = NOW() 
         WHERE stat_id = ?`,
        [newNumGames, newNumWins, currentStats.stat_id]
      );
      
      // console.log(`[STATS UPDATE] ✅ UPDATE réussi pour stat_id: ${currentStats.stat_id}`);
    } else {
      // Crée une nouvelle entrée de statistiques
      // console.log(`[STATS UPDATE] 🆕 INSERT - Première partie du jour`);
      // console.log(`[STATS UPDATE] 🆕 INSERT - 1 partie, ${isWin ? 1 : 0} victoire`);
      
      await db.query(
        `INSERT INTO stats (user_id, num_games, num_wins, timestamp) 
         VALUES (?, 1, ?, NOW())`,
        [userId, isWin ? 1 : 0]
      );
      
      // console.log(`[STATS UPDATE] ✅ INSERT réussi pour user_id: ${userId}`);
    }
    
    // console.log(`[STATS UPDATE] 🎉 Stats mises à jour avec succès !`);
    
    res.json({ 
      success: true, 
      message: "Statistiques mises à jour avec succès",
      game_played: 1,
      game_won: isWin ? 1 : 0,
      payout: payout
    });
    
  } catch (error) {
    console.error(`[STATS UPDATE] ❌ Erreur lors de la mise à jour des statistiques:`, error);
    res.status(500).json({ 
      error: "Erreur lors de la mise à jour des statistiques." 
    });
  }
});

module.exports = router;
