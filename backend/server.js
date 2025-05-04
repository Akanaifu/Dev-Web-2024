const express = require("express");
const path = require("path");
const db = require("./config/dbConfig");
const sessionRoutes = require("./routes/sessions");
const dataRoutes = require("./routes/data");
const userRoutes = require("./routes/users"); // Import des routes utilisateurs
const transactionRoutes = require("./routes/transactions");
const statsRoutes = require("./routes/stats");
const gameRoutes = require("./routes/games");
const betRoutes = require("./routes/bets");
const newGameRoutes = require("./routes/new_game");
const { verifyToken } = require("./middlewares/auth");
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

// Routes
app.use("/sessions", sessionRoutes); // Cannot GET /sessions
app.use("/data", dataRoutes);
app.use("/users", userRoutes); // Enregistrement des routes utilisateurs
app.use("/transactions", transactionRoutes);
app.use("/stats", statsRoutes);
app.use("/games", gameRoutes);
app.use("/bets", betRoutes);
app.use("/new-game", newGameRoutes);

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

app.listen(3000, () => {
  console.log("Serveur démarré sur le port 3000");
});
