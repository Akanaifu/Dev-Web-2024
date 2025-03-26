const express = require('express');
const router = express.Router();
const { getUsers, getGames, getTransactions } = require('../controllers/index');

// Route to get all users
router.get('/utilisateurs', getUsers);

// Route to get all games
router.get('/jeux', getGames);

// Route to get all transactions
router.get('/transactions', getTransactions);

module.exports = router;