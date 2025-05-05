// Service pour gérer les connexions WebSocket
class SocketService {
    constructor(io) {
      this.io = io;
      this.socketConnected = new Map();
      this.ipAddresses = new Map();
      
      // Configurer le nettoyage périodique
      this.setupPeriodicCleanup();
    }
    
    // Initialiser le service
    initialize() {
      this.io.on('connection', this.handleConnection.bind(this));
    }
    
    // Gérer une nouvelle connexion
    handleConnection(socket) {
      const clientId = socket.id;
      const clientIp = socket.handshake.address;
      
      console.log(`Nouvelle connexion: ${clientId} depuis ${clientIp}`);
      
      // Vérifier si cette IP est déjà connectée
      if (this.ipAddresses.has(clientIp)) {
        console.log(`IP ${clientIp} déjà connectée. Connexions actuelles: ${this.ipAddresses.get(clientIp)}`);
        this.ipAddresses.set(clientIp, this.ipAddresses.get(clientIp) + 1);
      } else {
        console.log(`Nouvelle IP connectée: ${clientIp}`);
        this.ipAddresses.set(clientIp, 1);
      }
      
      // Stocker le socket
      this.socketConnected.set(clientId, {
        socket: socket,
        ip: clientIp,
        connected: true,
        timestamp: Date.now()
      });
      
      // Envoyer le nombre de clients uniques
      this.broadcastClientCount();
      
      // Configurer les événements pour ce socket
      this.setupSocketEvents(socket, clientId, clientIp);
    }
    
    // Configurer les événements pour un socket spécifique
    setupSocketEvents(socket, clientId, clientIp) {
      // Gérer la déconnexion
      socket.on('disconnect', () => {
        console.log(`Socket déconnecté: ${clientId} depuis ${clientIp}`);
        
        // Mettre à jour les connexions pour cette IP
        if (this.ipAddresses.has(clientIp)) {
          const connections = this.ipAddresses.get(clientIp) - 1;
          if (connections <= 0) {
            this.ipAddresses.delete(clientIp);
          } else {
            this.ipAddresses.set(clientIp, connections);
          }
        }
        
        // Supprimer le socket
        this.socketConnected.delete(clientId);
        
        // Envoyer le nouveau nombre de clients
        this.broadcastClientCount();
      });
      
      // Gérer les messages
      socket.on('message', (data) => {
        console.log(`Message reçu de ${clientId}:`, data);
        socket.broadcast.emit('chat-message', data);
      });
      
      // Gérer le feedback de frappe
      socket.on("feedback", (data) => {
        socket.broadcast.emit('feedback', data);
      });
    }
    
    // Diffuser le nombre de clients connectés
    broadcastClientCount() {
      const uniqueClients = new Set([...this.ipAddresses.keys()]).size;
      console.log(`Nombre total de clients uniques: ${uniqueClients}`);
      this.io.emit('clients-total', uniqueClients);
    }
    
    // Configurer le nettoyage périodique des sockets inactifs
    setupPeriodicCleanup() {
      setInterval(() => {
        const now = Date.now();
        let cleaned = 0;
        
        for (const [id, clientData] of this.socketConnected.entries()) {
          // Si le socket est inactif depuis plus de 30 minutes
          if (now - clientData.timestamp > 30 * 60 * 1000) {
            console.log(`Nettoyage du socket inactif: ${id}`);
            this.socketConnected.delete(id);
            cleaned++;
            
            // Mettre à jour le compteur d'IP
            const ip = clientData.ip;
            if (this.ipAddresses.has(ip)) {
              const connections = this.ipAddresses.get(ip) - 1;
              if (connections <= 0) {
                this.ipAddresses.delete(ip);
              } else {
                this.ipAddresses.set(ip, connections);
              }
            }
          }
        }
        
        if (cleaned > 0) {
          const uniqueClients = new Set([...this.ipAddresses.keys()]).size;
          console.log(`Sessions inactives nettoyées: ${cleaned}, Clients uniques restants: ${uniqueClients}`);
          this.io.emit('clients-total', uniqueClients);
        }
      }, 5 * 60 * 1000); // Vérifier toutes les 5 minutes
    }
  }
  
  module.exports = SocketService;