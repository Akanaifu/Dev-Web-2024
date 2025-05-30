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

router.get("/bets/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const query = `
      SELECT b.amount, b.bet_status, b.combinaison, gs.timestamp, u.created_at
      FROM Bets b
      JOIN Games_session gs ON b.game_session_id = gs.game_session_id
      JOIN user u ON b.user_id = u.user_id -- Correct table name to lowercase 'user'
      WHERE b.user_id = ?
    `;
    const [rows] = await db.execute(query, [userId]);
    console.log("🚀 ~ router.get ~ rows:", rows);

    // Passe chaque combinaison et mise dans la fonction calculerGain
    const results = rows.map((row) => {
      const rouleaux = row.combinaison
        ? row.combinaison.replace(/[\[\]]/g, "").split(",").map(Number) // Remove square brackets and split
        : []; // Handle null combinaison
      const gain = calculerGain(rouleaux, row.amount, row.bet_status); // Appel avec bet_status
      return { ...row, gain };
    });

    const createdAt = rows[0]?.created_at; // Extract created_at
    results.forEach((row) => delete row.created_at); // Remove created_at from each bet
    console.log("🚀 ~ router.get ~ response:", { results, createdAt });
    res.status(200).json({ bets: results, created_at: createdAt });
  } catch (error) {
    console.error("Erreur lors de la récupération des paris :", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

module.exports = router;
