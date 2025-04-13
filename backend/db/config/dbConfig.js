const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost', // Remplacez par l'hôte de votre base de données
    user: 'root',      // Remplacez par votre utilisateur MariaDB
    password: 'M@ria', // Remplacez par votre mot de passe MariaDB
    database: 'casino_db', // Remplacez par le nom de votre base de données
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool.promise();
