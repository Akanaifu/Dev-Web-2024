const express = require("express");
const jwt = require("jsonwebtoken");
const mysql = require("mysql2");
const path = require("path");
const app = express();

// Middleware pour CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.use(express.json());

const secretKey = "ton_secret"; // Cette clé devrait être une variable d'environnement en production

// Configuration de la connexion à la base de données
const db = mysql.createConnection({
  host: "localhost", // Remplacez par l'hôte de votre base de données
  user: "root", // Remplacez par votre utilisateur MariaDB
  password: "casino", // Remplacez par votre mot de passe MariaDB
  database: "dev3", // Nom de la base de données
  port: 3306, // Port par défaut de MariaDB
});

// Vérification de la connexion
db.connect((err) => {
  if (err) {
    console.error("Erreur de connexion à la base de données:", err);
    process.exit(1);
  }
  console.log("Connecté à la base de données MariaDB");
});

// Route pour le login
app.post("/sessions/login", (req, res) => {
  const { username, password } = req.body;

  console.log("Tentative de connexion:", { username, password });

  // Vérifier les informations utilisateur (exemple simplifié)
  if (username === "user" && password === "pass") {
    const token = jwt.sign({ username }, secretKey, { expiresIn: "1h" });

    // Ajout d'informations utilisateur dans la réponse
    res.json({
      token,
      user: {
        username,
        id: 1,
        // autres informations utilisateur si nécessaire
      },
    });
  } else {
    res.status(401).json({ message: "Identifiants incorrects" });
  }
});

// Route protégée pour récupérer les infos de l'utilisateur connecté
app.get("/sessions/me", verifyToken, (req, res) => {
  res.json({
    username: req.user.username,
    id: 1,
    // autres informations utilisateur si nécessaire
  });
});

// Route pour la déconnexion (côté serveur)
app.get("/sessions/logout", (req, res) => {
  // En réalité, avec JWT, la déconnexion se fait côté client
  // en supprimant le token, mais on peut ajouter le token à une liste noire
  res.json({ success: true });
});

// Route pour récupérer des données
app.get("/data", (req, res) => {
  const query = "SELECT * FROM users"; // Remplacez "users" par le nom de votre table
  db.query(query, (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des données:", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
    res.json(results); // Assurez-vous que la réponse est toujours au format JSON
  });
});

// Route pour injecter des données
app.post("/data", (req, res) => {
  const { tableName, columns, values } = req.body;

  if (!tableName || !columns || !values) {
    return res
      .status(400)
      .json({ message: "Table name, columns, and values are required" });
  }

  // Validation du nom de la table (alphanumérique uniquement)
  if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
    return res.status(400).json({ message: "Invalid table name" });
  }

  const columnsArray = columns.split(",").map((col) => col.trim());
  const valuesArray = values.split(",").map((val) => val.trim());

  if (columnsArray.length !== valuesArray.length) {
    return res
      .status(400)
      .json({ message: "The number of columns and values must match" });
  }

  const query = `INSERT INTO ${tableName} (${columnsArray.join(
    ","
  )}) VALUES (${valuesArray.map(() => "?").join(",")})`;

  console.log("Executing query:", query, "with values:", valuesArray);

  db.query(query, valuesArray, (err, results) => {
    if (err) {
      console.error("Erreur lors de l'injection des données:", err);
      return res
        .status(500)
        .json({ message: "Erreur serveur", error: err.message });
    }
    res.json({
      success: true,
      message: "Données injectées avec succès",
      id: results.insertId,
    });
  });
});

// Route pour servir la page HTML
app.get("/inject-data", (req, res) => {
  const filePath = path.join(__dirname, "inject-data.html");
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("Erreur lors du chargement du fichier HTML:", err);
      res.status(500).send("Erreur serveur");
    }
  });
});

// Middleware pour vérifier le token JWT
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token manquant" });
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Token invalide" });
    }

    req.user = user;
    next();
  });
}

app.listen(3000, () => {
  console.log("Serveur démarré sur le port 3000");
});
