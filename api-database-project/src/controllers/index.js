const queries = require('../db/queries');

const getUsers = async (req, res) => {
    try {
        const users = await queries.getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getGames = async (req, res) => {
    try {
        const games = await queries.getAllGames();
        res.status(200).json(games);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getTransactions = async (req, res) => {
    try {
        const transactions = await queries.getAllTransactions();
        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getUsers,
    getGames,
    getTransactions,
};