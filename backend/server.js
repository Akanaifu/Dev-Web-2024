require('dotenv').config();
const express = require("express");
const path = require("path");
const http = require("http");
const socketIo = require('socket.io');
const cookieParser = require('cookie-parser');
const port = process.env.PORT || 3000;

// Configuration
const db = require("./config/dbConfig");
const socketConfig = require("./config/socketConfig");

// Routes
const sessionRoutes = require("./routes/sessions");
const dataRoutes = require("./routes/data");
const userRoutes = require("./routes/users");
const transactionRoutes = require("./routes/transactions");
const statsRoutes = require("./routes/stats");
const gameRoutes = require("./routes/games");
const betRoutes = require("./routes/bets");
const newGameRoutes = require("./routes/new_game");
const registerRoutes = require("./routes/register");

// Services
const SocketService = require("./services/socketService");

// Initialisation de l'application Express
const app = express();
const server = http.createServer(app);
const io = socketIo(server, socketConfig);

// Configuration de Socket.IO
const socketService = new SocketService(io);
socketService.initialize();

// ===== MIDDLEWARE CORS CORRIGÉ =====
app.use((req, res, next) => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS ? 
    process.env.ALLOWED_ORIGINS.split(',') : 
    ['http://localhost:4200'];
  
  const origin = req.headers.origin;
  
  // Vérifier si l'origine est autorisée
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  
  res.header("Access-Control-Allow-Credentials", "true");
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

// Middlewares pour l'API
app.use(express.json());
app.use(cookieParser());

// Routes de l'API
app.use("/sessions", sessionRoutes);
app.use("/register", registerRoutes);
app.use("/data", dataRoutes);
app.use("/users", userRoutes);
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

// Démarrer le serveur
server.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port} (API et WebSocket)`);
});