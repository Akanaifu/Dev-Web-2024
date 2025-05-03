const db = require("./config/dbConfig");

async function testConnection() {
  try {
    const [rows] = await db.query("SELECT 1 + 1 AS result");
    console.log("Connexion réussie ! Résultat de la requête :", rows[0].result);
  } catch (error) {
    console.error(
      "Erreur lors de la connexion à la base de données :",
      error.message
    );
  } finally {
    db.end(); // Ferme la connexion
  }
}

testConnection();
