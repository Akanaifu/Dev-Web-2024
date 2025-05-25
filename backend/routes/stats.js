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
