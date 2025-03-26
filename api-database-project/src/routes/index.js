const express = require('express');
const router = express.Router();
const { getUsers, getGames, getTransactions, getOneUser } = require('../controllers/index');

// Route to get all users
router.get('/utilisateurs', getUsers);

// Route to get all games
router.get('/jeux', getGames);

// Route to get all transactions
router.get('/transactions', getTransactions);

// Route pour obtenir un utilisateur par ID
router.get('/utilisateurs/:id', getOneUser);

module.exports = router;