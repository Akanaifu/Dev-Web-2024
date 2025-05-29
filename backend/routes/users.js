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

// Endpoint pour récupérer le solde d'un utilisateur par son ID
router.get("/:id/balance", async (req, res) => {
  const userId = parseInt(req.params.id);
  try {
    const [rows] = await db.query("SELECT solde FROM user WHERE user_id = ?", [
      userId,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    res.json({ balance: rows[0].solde });
  } catch (err) {
    console.error("Erreur SQL:", err);
    res.status(500).json({
      error: "Erreur lors de la récupération du solde de l'utilisateur.",
    });
  }
});

// Endpoint pour mettre à jour un utilisateur
router.put("/:id", async (req, res) => {
  const { nom, email } = req.body;
  const userId = parseInt(req.params.id);
  try {
    const [result] = await db.query(
      "UPDATE user SET nom = ?, email = ? WHERE user_id = ?",
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
    const [result] = await db.query("DELETE FROM user WHERE user_id = ?", [
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

// Nouvelle route pour modifier le solde d'un utilisateur
router.put("/:id/balance", async (req, res) => {
  const userId = parseInt(req.params.id);
  const { value, action } = req.body;

  if (typeof value !== "number" || !["add", "subtract"].includes(action)) {
    return res.status(400).json({ error: "Paramètres invalides." });
  }

  try {
    // Récupérer le solde actuel
    const [rows] = await db.query("SELECT solde FROM user WHERE user_id = ?", [
      userId,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    let newBalance = rows[0].solde;
    let transactionType,
      transactionStatus = 1;

    if (action === "add") {
      newBalance += value;
      transactionType = 1; // 1 = dépôt
    } else if (action === "subtract") {
      newBalance -= value;
      transactionType = 2; // 2 = retrait
      if (newBalance < 0) {
        newBalance = 0; // empêcher solde négatif
        transactionStatus = 0; // statut échec si dépassement
      }
    }

    // Mettre à jour le solde
    await db.query("UPDATE user SET solde = ? WHERE user_id = ?", [
      newBalance,
      userId,
    ]);

    // Insérer la transaction bancaire
    await db.query(
      "INSERT INTO Banking_transaction (user_id, amount_banking, transaction_type, transaction_status) VALUES (?, ?, ?, ?)",
      [userId, value, transactionType, transactionStatus]
    );

    res.json({ message: "Solde mis à jour.", balance: newBalance });
  } catch (err) {
    console.error("Erreur SQL:", err);
    res.status(500).json({ error: "Erreur lors de la modification du solde." });
  }
});

module.exports = router;
