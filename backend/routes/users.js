const express = require("express");
const db = require("../config/dbConfig"); // Chemin corrigé
const router = express.Router();

// Endpoint pour récupérer la liste des utilisateurs
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM user");
    res.json(rows);
  } catch (err) {
    console.error("Erreur SQL:", err); // Ajout d'un log pour afficher l'erreur
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des utilisateurs." });
  }
});

// Endpoint pour récupérer un utilisateur spécifique par son ID
router.get("/:id", async (req, res) => {
  const userId = parseInt(req.params.id);
  try {
    const [rows] = await db.query("SELECT * FROM user WHERE id = ?", [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    res.json(rows[0]);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération de l'utilisateur." });
  }
});

// Endpoint pour mettre à jour un utilisateur
router.put("/:id", async (req, res) => {
  const { nom, email } = req.body;
  const userId = parseInt(req.params.id);
  try {
    const [result] = await db.query(
      "UPDATE utilisateurs SET nom = ?, email = ? WHERE id = ?",
      [nom, email, userId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    res.json({ message: "Utilisateur mis à jour avec succès." });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erreur lors de la mise à jour de l'utilisateur." });
  }
});

// Endpoint pour supprimer un utilisateur
router.delete("/:id", async (req, res) => {
  const userId = parseInt(req.params.id);
  try {
    const [result] = await db.query("DELETE FROM utilisateurs WHERE id = ?", [
      userId,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    res.json({ message: "Utilisateur supprimé avec succès." });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erreur lors de la suppression de l'utilisateur." });
  }
});

// Endpoint pour modifier les données d'un utilisateur
router.post("/add", async (req, res) => {
  const { joueurId, solde, gain } = req.body;

  try {
    const query = `
      INSERT INTO Bets (user_id, amount, profit)
      VALUES (?, ?, ?)
    `;
    await db.execute(query, [joueurId, solde, gain]);
    res.status(201).json({ message: "Données ajoutées avec succès." });
  } catch (error) {
    console.error("Erreur lors de l'ajout des données :", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

module.exports = router;
