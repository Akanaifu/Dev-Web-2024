const jwt = require('jsonwebtoken');
const { blacklistedTokens } = require('./auth');
const secretKey = "ton_secret"; // Utiliser la même clé que pour l'API

// Middleware d'authentification pour Socket.IO
function socketAuthMiddleware(socket, next) {
  // Pour les tests initiaux, permettre des connexions sans authentification
  const skipAuth = process.env.NODE_ENV === 'development';
  if (skipAuth) {
    return next();
  }

  // Récupérer le token d'authentification
  const token = socket.handshake.auth.token || 
                socket.handshake.headers.authorization;
  
  if (!token) {
    return next(new Error('Authentification requise'));
  }
  
  // Vérifier si le token est dans la liste noire
  if (blacklistedTokens.has(token)) {
    return next(new Error('Session expirée, veuillez vous reconnecter'));
  }
  
  // Vérifier le token
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return next(new Error('Token invalide'));
    }
    
    // Attacher les informations utilisateur au socket
    socket.user = decoded;
    next();
  });
}

module.exports = socketAuthMiddleware;