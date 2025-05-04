const express = require("express");
const db = require("../config/dbConfig");
const router = express.Router();

// Route pour récupérer des données
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM user"); // Utilisation d'await
    res.json(rows);
  } catch (err) {
    console.error("Erreur lors de la récupération des données:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Route pour injecter des données
router.post("/", async (req, res) => {
  const { tableName, columns, values } = req.body;

  if (!tableName || !columns || !values) {
    return res
      .status(400)
      .json({ message: "Table name, columns, and values are required" });
  }

  if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
    return res.status(400).json({ message: "Invalid table name" });
  }

  const columnsArray = columns.split(",").map((col) => col.trim());
  const valuesArray = values.split(",").map((val) => val.trim());

  if (columnsArray.length !== valuesArray.length) {
    return res
      .status(400)
      .json({ message: "The number of columns and values must match" });
  }

  const query = `INSERT INTO ${tableName} (${columnsArray.join(
    ","
  )}) VALUES (${valuesArray.map(() => "?").join(",")})`;

  try {
    const [results] = await db.query(query, valuesArray); // Utilisation d'await
    res.json({
      success: true,
      message: "Données injectées avec succès",
      id: results.insertId,
    });
  } catch (err) {
    console.error("Erreur lors de l'injection des données:", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

module.exports = router;
