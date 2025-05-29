const express = require("express");
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");

// Configuration
const db = require("./config/dbConfig");
const socketConfig = require("./config/socketConfig");

// Middlewares⚠️⚠️⚠️
//const socketAuthMiddleware = require("./middlewares/socketAuth");⚠️⚠️⚠️
//⚠️⚠️⚠️ probleme ici pas encore résolu ⚠️⚠️⚠️

// Routes
const sessionRoutes = require("./routes/sessions");

const userRoutes = require("./routes/users");

const statsRoutes = require("./routes/stats");

const betRoutes = require("./routes/bets");
const newGameRoutes = require("./routes/new_game");
const registerRoutes = require("./routes/register");
const playerRoutes = require("./routes/get_id");
const editCompteRoutes = require("./routes/edit-compte");

const soldeRoutes = require("./routes/update_solde");

//Roulette 
const rouletteRoutes = require("./routes/roulette-net");
const rouletteNetPrepareBettingBoard = require("./routes/roulette-net-prepareBettingBoard");
// Services
const SocketService = require("./services/socketService");

// Initialisation de l'application Express
const app = express();
const server = http.createServer(app);
const io = socketIo(server, socketConfig);

// Configuration de Socket.IO
//io.use(socketAuthMiddleware);
const socketService = new SocketService(io);
socketService.initialize();

// Middleware pour CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:4200");
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
app.use(bodyParser.json());

// Routes de l'API
app.use("/sessions", sessionRoutes);
app.use("/register", registerRoutes);

app.use("/users", userRoutes);

app.use("/stats", statsRoutes);

app.use("/bets", betRoutes);
app.use("/new-game", newGameRoutes);
app.use("/get_id", playerRoutes);
app.use("/edit-compte", editCompteRoutes);
app.use("/api/roulette", rouletteRoutes);
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

// Démarrer le serveur
server.listen(3000, () => {
  console.log("Serveur démarré sur le port 3000 (API et WebSocket)");
});
