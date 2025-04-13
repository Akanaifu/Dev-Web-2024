const express = require('express');
const app = express();
const PORT = 3000;

// Middleware pour parser le JSON
app.use(express.json());

// Importation des routes des jeux
const gameRoutes = require('./routes/games');
app.use('/games', gameRoutes);

// Importation des routes des utilisateurs
const userRoutes = require('./routes/users');
app.use('/users', userRoutes);

// Importation des routes des mises
const betRoutes = require('./routes/bets');
app.use('/bets', betRoutes);

// Importation des routes des transactions
const transactionRoutes = require('./routes/transactions');
app.use('/transactions', transactionRoutes);

// Importation des routes des stats
const statsRoutes = require('./routes/stats');
app.use('/stats', statsRoutes);

// // Importation des routes d'authentification
// const authRoutes = require('./routes/auth');
// app.use('/auth', authRoutes);

// // Importation des routes de la machine à sous
// const slotRoutes = require('./routes/slots');
// app.use('/slots', slotRoutes);

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
