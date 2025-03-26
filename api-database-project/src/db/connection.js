const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DATABASE_PATH = path.resolve(__dirname, '../../db/casino.db');

const connectToDatabase = () => {
    const db = new sqlite3.Database(DATABASE_PATH, sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error('Error connecting to the database:', err.message);
        } else {
            console.log('Connected to the SQLite database.');
        }
    });
    return db;
};

module.exports = connectToDatabase;