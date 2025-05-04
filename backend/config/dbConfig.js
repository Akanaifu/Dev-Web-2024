const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "localhost", // Assurez-vous que c'est l'hôte correct
  user: "dev", // Assurez-vous que c'est l'utilisateur correct
  password: "kzno", // Assurez-vous que c'est le mot de passe correct
  database: "casino", // Assurez-vous que c'est le nom de la base de données correct
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool.promise();
