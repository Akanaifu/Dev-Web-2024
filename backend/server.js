//variables d'environnement
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
const userRoutes = require("./routes/users");
const statsRoutes = require("./routes/stats");
const betRoutes = require("./routes/bets");
const newGameRoutes = require("./routes/new_game");
const registerRoutes = require("./routes/register");
const playerRoutes = require("./routes/get_id");
const editCompteRoutes = require("./routes/edit-compte");
// const rouletteOddsRoutes = require("./routes/roulette-net-odds");
const uploadAvatarRouter = require('./routes/upload-avatar');




//Roulette
const rouletteRoutes = require("./routes/roulette-net");
const rouletteNetPrepareBettingBoard = require("./routes/roulette-net-prepareBettingBoard");
// Services
const SocketService = require("./services/socketService");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, socketConfig);

// Configuration de Socket.IO
const socketService = new SocketService(io);
socketService.initialize();

app.use((req, res, next) => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS ? 
    process.env.ALLOWED_ORIGINS.split(',') : 
    ['http://localhost:4200'];
  
  const origin = req.headers.origin;
  
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
app.use("/api/sessions", sessionRoutes);
app.use("/api/register", registerRoutes);

app.use("/api/users", userRoutes);

app.use("/api/stats", statsRoutes);

app.use("/api/bets", betRoutes);
app.use("/api/new-game", newGameRoutes);
app.use("/api/get_id", playerRoutes);
app.use("/api/edit-compte", editCompteRoutes);
app.use("/api/bets", betRoutes);
app.use("/api/new-game", newGameRoutes);
app.use("/api/get_id", playerRoutes);
app.use("/api/edit-compte", editCompteRoutes);
app.use("/api/roulette", rouletteRoutes);
app.use('/api/avatar', uploadAvatarRouter);
app.use("/api/roulette-odds", rouletteNetPrepareBettingBoard.router);

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

// Sert le dossier avatar en statique
app.use('/api/avatar', express.static(path.join(__dirname, 'avatar')));

// Démarrer le serveur
server.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port} (API et WebSocket)`);
});
