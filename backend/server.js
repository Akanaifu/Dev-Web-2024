const express = require('express');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise'); // Notez /promise pour async/await
const bcrypt = require('bcrypt'); // Pour le hachage sécurisé des mots de passe
const app = express();

// Middleware pour CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

const secretKey = process.env.JWT_SECRET || 'ton_secret'; // Utiliser de préférence une variable d'environnement

// Configuration de la connexion MySQL
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'dev',
  password: process.env.DB_PASSWORD || 'kzno',
  database: process.env.DB_NAME || 'casino',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Route pour le login
app.post('/sessions/login', async (req, res) => {
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
      // Créer le token JWT
      const token = jwt.sign(
        { 
          username: user.email, 
          userId: user.user_id 
        }, 
        secretKey, 
        { expiresIn: '1h' }
      );
      // Envoyer le token et les infos utilisateur
      res.json({
        token,
        user: {
          username: user.email, 
          userId: user.user_id 
          // autres informations utilisateur si nécessaire
        }
      });
      console.log(`Connexion autorisée pour l'utilisateur ${user.email} (ID: ${user.user_id})`)
    } else {
      res.status(401).json({ message: 'Identifiants incorrects' });
    }
  } catch (err) {
    console.error('Erreur de connexion à la base de données:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route protégée pour récupérer les infos de l'utilisateur connecté
app.get('/sessions/me', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT user_id, email FROM User WHERE id = ?',
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

// Route pour la déconnexion (côté serveur)
app.get('/sessions/logout', (req, res) => {
  // En réalité, avec JWT, la déconnexion se fait côté client
  // en supprimant le token, mais on peut ajouter le token à une liste noire
  console.log('Déconnexion utilisateur');
  res.json({ success: true });
});

// Middleware pour vérifier le token JWT
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Token manquant' });
  }
  
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token invalide' });
    }
    req.user = decoded;
    next();
  });
}

app.listen(3000, () => {
  console.log('Serveur démarré sur le port 3000');
});