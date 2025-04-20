const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});

// Configuration avancée de Socket.io
const io = require('socket.io')(server, {
  cors: {
    origin: "*",  // Pour le développement. En production, utilisez l'URL exacte
    methods: ["GET", "POST"],
    credentials: true
  },
  // Améliorer la gestion des connexions
  pingTimeout: 5000,
  pingInterval: 10000,
  connectTimeout: 10000,
  transports: ['websocket']
});

app.use(express.static(path.join(__dirname, '')));

// Stockage des sockets par ID client
let socketConnected = new Map();

// Stockage des IPs de clients pour détecter plusieurs connexions
let ipAddresses = new Map();

io.on('connection', onConnected);

function onConnected(socket) {
  const clientId = socket.id;
  const clientIp = socket.handshake.address;
  
  console.log(`Nouvelle connexion: ${clientId} depuis ${clientIp}`);
  
  // Vérifier si cette IP est déjà connectée
  if (ipAddresses.has(clientIp)) {
    console.log(`IP ${clientIp} déjà connectée. Connexions actuelles: ${ipAddresses.get(clientIp)}`);
    ipAddresses.set(clientIp, ipAddresses.get(clientIp) + 1);
  } else {
    console.log(`Nouvelle IP connectée: ${clientIp}`);
    ipAddresses.set(clientIp, 1);
  }
  
  // Stocker le socket
  socketConnected.set(clientId, {
    socket: socket,
    ip: clientIp,
    connected: true,
    timestamp: Date.now()
  });

  // Envoyer le nombre de clients uniques (par IP)
  const uniqueClients = new Set([...ipAddresses.keys()]).size;
  console.log(`Nombre total de clients uniques: ${uniqueClients}`);
  io.emit('clients-total', uniqueClients);

  // Gérer la déconnexion
  socket.on('disconnect', () => {
    console.log(`Socket déconnecté: ${clientId} depuis ${clientIp}`);
    
    // Mettre à jour les connexions pour cette IP
    if (ipAddresses.has(clientIp)) {
      const connections = ipAddresses.get(clientIp) - 1;
      if (connections <= 0) {
        ipAddresses.delete(clientIp);
      } else {
        ipAddresses.set(clientIp, connections);
      }
    }
    
    // Supprimer le socket
    socketConnected.delete(clientId);
    
    // Envoyer le nouveau nombre de clients uniques
    const uniqueClients = new Set([...ipAddresses.keys()]).size;
    console.log(`Nombre total de clients uniques après déconnexion: ${uniqueClients}`);
    io.emit('clients-total', uniqueClients);
  });

  // Gérer les messages
  socket.on('message', (data) => {
    console.log(`Message reçu de ${clientId}:`, data);
    // Envoyer à tous les autres clients
    socket.broadcast.emit('chat-message', data);
  });

  // Gérer le feedback de frappe
  socket.on("feedback", (data) => {
    socket.broadcast.emit('feedback', data);
  });
}

// Nettoyage périodique des sockets inactifs
setInterval(() => {
  const now = Date.now();
  let cleaned = 0;
  
  for (const [id, clientData] of socketConnected.entries()) {
    // Si le socket est inactif depuis plus de 30 minutes, le nettoyer
    if (now - clientData.timestamp > 30 * 60 * 1000) {
      console.log(`Nettoyage du socket inactif: ${id}`);
      socketConnected.delete(id);
      cleaned++;
      
      // Mettre à jour le compteur d'IP si nécessaire
      const ip = clientData.ip;
      if (ipAddresses.has(ip)) {
        const connections = ipAddresses.get(ip) - 1;
        if (connections <= 0) {
          ipAddresses.delete(ip);
        } else {
          ipAddresses.set(ip, connections);
        }
      }
    }
  }
  
  if (cleaned > 0) {
    const uniqueClients = new Set([...ipAddresses.keys()]).size;
    console.log(`Sessions inactives nettoyées: ${cleaned}, Clients uniques restants: ${uniqueClients}`);
    io.emit('clients-total', uniqueClients);
  }
}, 5 * 60 * 1000); // Vérifier toutes les 5 minutes