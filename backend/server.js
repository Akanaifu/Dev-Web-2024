const express = require('express');
const jwt = require('jsonwebtoken');
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

const secretKey = 'ton_secret'; // Cette clé devrait être une variable d'environnement en production

// Route pour le login
app.post('/sessions/login', (req, res) => {
    const { username, password } = req.body;
    
    console.log('Tentative de connexion:', { username, password });
    
    // Vérifier les informations utilisateur (exemple simplifié)
    if (username === 'user' && password === 'pass') {
        const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });
        
        // Ajout d'informations utilisateur dans la réponse
        res.json({ 
            token,
            user: {
                username,
                id: 1,
                // autres informations utilisateur si nécessaire
            } 
        });
    } else {
        res.status(401).json({ message: 'Identifiants incorrects' });
    }
});

// Route protégée pour récupérer les infos de l'utilisateur connecté
app.get('/sessions/me', verifyToken, (req, res) => {
    res.json({
        username: req.user.username,
        id: 1,
        // autres informations utilisateur si nécessaire
    });
});

// Route pour la déconnexion (côté serveur)
app.get('/sessions/logout', (req, res) => {
    // En réalité, avec JWT, la déconnexion se fait côté client
    // en supprimant le token, mais on peut ajouter le token à une liste noire
    res.json({ success: true });
});

// Middleware pour vérifier le token JWT
function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'Token manquant' });
    }
    
    jwt.verify(token, secretKey, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token invalide' });
        }
        
        req.user = user;
        next();
    });
}

app.listen(3000, () => {
    console.log('Serveur démarré sur le port 3000');
});