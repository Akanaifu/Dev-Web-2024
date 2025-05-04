const express = require("express");
const jwt = require("jsonwebtoken");
const { verifyToken } = require("../middlewares/auth");
const router = express.Router();
const db = require("../config/dbConfig");
const secretKey = "ton_secret"; // Cette clé devrait être une variable d'environnement en production
const blacklistedTokens = new Set(); // En production, utilisez Redis ou une base de données

//⚠️ POST/LOGIN ⚠️
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('Tentative de connexion:', { username });
  
  try {
    // Avec mysql2/promise, on n'utilise pas getConnection()
    // On peut directement exécuter des requêtes sur l'objet pool
    const [rows] = await db.query(
      'SELECT user_id, email, password FROM User WHERE email = ?', 
      [username]
    );
    
    // Vérifier si l'utilisateur existe
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Identifiants incorrects' });
    }
    
    const user = rows[0];
    
    // Vérifier le mot de passe
    // Si vous utilisez bcrypt (recommandé)
    //const passwordMatch = await bcrypt.compare(password, user.password);
    
    // Alternative si les mots de passe sont stockés en clair (non recommandé)
    const passwordMatch = (password === user.password);
    
    if (passwordMatch) {
      const token = jwt.sign({
        username: user.email,
        userId: user.user_id
      }, 
      secretKey, 
      { expiresIn: '1h' }
    );
    
      // Définir un cookie HTTP-Only
      res.cookie('auth_token', token, {
        httpOnly: true,       // Inaccessible via JavaScript
        secure: process.env.NODE_ENV === 'production', // HTTPS en production
        maxAge: 3600000,      // Durée en millisecondes (1h)
        sameSite: 'strict'    // Protection CSRF
      });
      
      res.json({
        user: {
          username: user.email,
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
  const token = req.headers['authorization'].split(' ')[1];
  // Ajouter le token à la liste noire
  blacklistedTokens.add(token);
  console.log('Déconnexion utilisateur');
  res.json({ success: true });
});

module.exports = router;
