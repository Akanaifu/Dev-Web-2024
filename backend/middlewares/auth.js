const jwt = require("jsonwebtoken");
const secretKey = "ton_secret"; // Cette clé devrait être une variable d'environnement en production

// Déclarer la Set pour stocker les tokens révoqués
const blacklistedTokens = new Set();

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = req.cookies.auth_token;
  
  if (!token) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  // Vérifier si le token est dans la liste noire
  if (blacklistedTokens.has(token)) {
    return res.status(401).json({ message: 'Session expirée, veuillez vous reconnecter' });
  }
 
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token invalide' });
    }
   
    req.user = decoded;
    next();
  });
}

// Fonction pour ajouter un token à la liste noire
function revokeToken(token) {
  blacklistedTokens.add(token);
}

module.exports = { verifyToken, revokeToken, blacklistedTokens };