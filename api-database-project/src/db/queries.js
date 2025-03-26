// src/db/queries.js
const db = require('./connection');

// Function to fetch all users from the database
const getAllUsers = () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM utilisateurs', [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

const getOneUser = (id) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM utilisateurs WHERE id = ?', [id], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

// Function to fetch all games from the database
const getAllGames = () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM jeux', [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

// Function to fetch all transactions from the database
const getAllTransactions = () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM transactions', [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};


module.exports = {
    getAllUsers,
    getAllGames,
    getAllTransactions,
};