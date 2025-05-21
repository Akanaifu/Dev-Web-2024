const express = require("express");
const db = require("../config/dbConfig"); // Utilisation de MariaDB
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

// Route pour récupérer le win rate par jeu pour un utilisateur spécifique
router.get("/:id/winrate", async (req, res) => {
  const userId = parseInt(req.params.id);
  try {
    const query = `
      SELECT 
        gs.name AS game_name,
        SUM(s.num_wins) AS total_wins,
        SUM(s.num_games) AS total_games,
        (SUM(s.num_wins) / SUM(s.num_games)) * 100 AS win_rate
      FROM Stats s
      JOIN Bets b ON s.user_id = b.user_id
      JOIN Games_session gs ON b.game_session_id = gs.game_session_id
      WHERE s.user_id = ?
      GROUP BY gs.name
    `;
    const [rows] = await db.query(query, [userId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération du win rate." });
  }
});

// Route pour récupérer le nombre de partie joué par utilisateur
//http://localhost:3000/stats/:id/numberOfGame
router.get("/:id/numberOfGame", async (req, res) => {
  const userId = parseInt(req.params.id);
  try {
    const query = `
      SELECT 
      gs.name AS game_name,
      COUNT(DISTINCT b.game_session_id) AS games_played
      FROM Bets b
      JOIN Games_session gs ON b.game_session_id = gs.game_session_id
      WHERE b.user_id = ?
      GROUP BY gs.name
    `;
    const [rows] = await db.query(query, [userId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération du win rate." });
  }
});

module.exports = router;
