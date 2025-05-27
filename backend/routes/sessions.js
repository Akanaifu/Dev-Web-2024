const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt")
const { verifyToken } = require("../middlewares/auth");
const router = express.Router();
const db = require("../config/dbConfig");
const secretKey = "ton_secret"; // Cette clé devrait être une variable d'environnement en production
const blacklistedTokens = new Set(); // En production, utilisez Redis ou une base de données

//⚠️ POST/LOGIN ⚠️
// POST/LOGIN
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('Tentative de connexion:', { username });
  
  try {
    // Vérifie si c'est un email ou un nom d'utilisateur
    const isEmail = username.includes('@');
    
    // Changer la requête selon le type d'identifiant
    const query = isEmail 
      ? 'SELECT user_id, username, email, password FROM User WHERE email = ?' 
      : 'SELECT user_id, username, email, password FROM User WHERE username = ?';
    
    
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Identifiants incorrects' });
    }
    
    const user = rows[0];
    
    // Utiliser bcrypt.compare pour vérifier le mot de passe
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (passwordMatch) {
      const token = jwt.sign({
        username: user.username,
        email: user.email,
        userId: user.user_id
      }, 
      secretKey, 
      { expiresIn: '1h' }
    );
    
      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600000,
        sameSite: 'strict'
      });
      
      res.json({
        user: {
          username: user.username,
          email: user.email,
          userId: user.user_id
        }
      });
    } else {
      res.status(401).json({ message: 'Identifiants incorrects' });
    }
  } catch (err) {
    console.error('Erreur de connexion à la base de données:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ⚠️ GET/ME ⚠️
// Route protégée pour récupérer les infos de l'utilisateur connecté
router.get('/me', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT user_id, email FROM User WHERE user_id = ?',
      [req.user.userId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    const user = rows[0];
    res.json({
      username: user.email,
      id: user.user_id,
      // autres informations utilisateur si nécessaire
    });
  } catch (err) {
    console.error('Erreur lors de la récupération des infos utilisateur:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ⚠️ GET/LOGOUT ⚠️
router.get('/logout', verifyToken, (req, res) => {
  const token = req.cookies.auth_token;
  // Ajouter le token à la liste noire
  blacklistedTokens.add(token);
  
  // Effacer le cookie
  res.clearCookie('auth_token');
  
  console.log('Déconnexion utilisateur');
  res.json({ success: true });
});

module.exports = router;
