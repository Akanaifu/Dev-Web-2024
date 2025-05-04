const express = require("express");
const db = require("../config/dbConfig"); // Chemin corrigé
const router = express.Router();

// Endpoint pour récupérer la liste des transactions
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM banking_transaction");
    res.json(rows);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des transactions." });
  }
});

// Endpoint pour récupérer une transaction spécifique par son ID
router.get("/:id", async (req, res) => {
  const transactionId = parseInt(req.params.id);
  try {
    const [rows] = await db.query("SELECT * FROM transactions WHERE id = ?", [
      transactionId,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Transaction non trouvée" });
    }
    res.json(rows[0]);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération de la transaction." });
  }
});

module.exports = router;
