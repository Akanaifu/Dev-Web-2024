const express = require("express");
const jwt = require("jsonwebtoken");
const { verifyToken } = require("../middlewares/auth");
const router = express.Router();

const secretKey = "ton_secret"; // Cette clé devrait être une variable d'environnement en production

// Route pour le login
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  console.log("Tentative de connexion:", { username, password });

  if (username === "user" && password === "pass") {
    const token = jwt.sign({ username }, secretKey, { expiresIn: "1h" });
    res.json({
      token,
      user: {
        username,
        id: 1,
      },
    });
  } else {
    res.status(401).json({ message: "Identifiants incorrects" });
  }
});

// Route protégée pour récupérer les infos de l'utilisateur connecté
router.get("/me", verifyToken, (req, res) => {
  res.json({
    username: req.user.username,
    id: 1,
  });
});

// Route pour la déconnexion
router.get("/logout", (req, res) => {
  res.json({ success: true });
});

module.exports = router;
