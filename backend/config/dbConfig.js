const mysql = require("mysql2");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "db",
  user: process.env.DB_USER || "dev",
  password: process.env.DB_PASSWORD || "casino",
  database: process.env.DB_NAME || "casino",
  port: process.env.DB_PORT || "3306",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const testConnection = async () => {
  try {
    const promisePool = pool.promise();
    const [rows] = await promisePool.query('SELECT 1 as test');
    console.log('✅ Connexion à la base de données réussie!');
    console.log('📊 Test de connexion:', rows);
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error);
    return false;
  }
};

testConnection();

module.exports = pool.promise();