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
      SELECT gs.name AS game_name,
             SUM(CASE WHEN b.bet_status = 'win' THEN 1 ELSE 0 END) AS total_wins,
             COUNT(*) AS total_games,
             ROUND( SUM( CASE WHEN b.bet_status = 'win' THEN 1 ELSE 0 END) / COUNT(*), 2)*100 AS win_rate
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
router.get("/:id/numberOfGame", async (req, res) => {
  const userId = parseInt(req.params.id);
  try {
    const query = `
      SELECT sum(num_games) 'nombre de partie', SUM(num_wins) AS 'nombre de victoire'
      FROM stats
      WHERE user_id = ?
    `;
    const [rows] = await db.query(query, [userId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération du win rate." });
  }
});

module.exports = router;
