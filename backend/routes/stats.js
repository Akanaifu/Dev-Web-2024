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

router.get("/bets/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const query = `
      SELECT amount, bet_status, combinaison, created_at 
      FROM Bets 
      WHERE user_id = ?
    `;
    const [rows] = await db.execute(query, [userId]);

    // Passe chaque combinaison et mise dans la fonction calculerGain
    const results = rows.map((row) => {
      const rouleaux = row.combinaison.split(",").map(Number); // Convertir la combinaison en tableau de nombres
      const gain = calculerGain(rouleaux, row.amount, row.bet_status); // Appel avec bet_status
      console.log("🚀 ~ results ~ calculerGain:", calculerGain)

      return { ...row, gain };
    });

    res.status(200).json(results);
  } catch (error) {
    console.error("Erreur lors de la récupération des paris :", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

module.exports = router;
