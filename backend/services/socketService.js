class SocketService {
    constructor(io) {
      this.io = io;
      this.socketConnected = new Map();
      this.ipAddresses = new Map();
      this.roomCounts = {
        'general': 0,
        'machine-a-sous': 0,
        'roulette': 0,
        'poker': 0
      };
      
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
        timestamp: Date.now(),
        currentRoom: 'general',
        previousRoom: null
      });
      
      // Rejoindre le salon par défaut
      socket.join('general');
      this.roomCounts['general']++;
      
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
        
        // Récupérer le salon actuel avant de supprimer
        const clientData = this.socketConnected.get(clientId);
        if (clientData) {
          const currentRoom = clientData.currentRoom || 'general';

          this.roomCounts[currentRoom] = Math.max(0, this.roomCounts[currentRoom] - 1);
          // Mettre à jour les connexions pour cette IP
          if (this.ipAddresses.has(clientIp)) {
            const connections = this.ipAddresses.get(clientIp) - 1;
            if (connections <= 0) {
              this.ipAddresses.delete(clientIp);
            } else {
              this.ipAddresses.set(clientIp, connections);
            }
          }
        }
        
        // Supprimer le socket
        this.socketConnected.delete(clientId);
        
        // Envoyer le nouveau nombre de clients
        this.broadcastClientCount();
      });
      
      // Gérer les changements de salon
      socket.on('join-room', (roomName) => {
        // Vérifier si le salon est valide
        if (!['general', 'machine-a-sous', 'roulette', 'poker'].includes(roomName)) {
          socket.emit('error', { message: 'Salon non valide' });
          return;
        }
        
        // Récupérer le salon actuel
        const clientData = this.socketConnected.get(clientId);
        if (!clientData) return;
        
        const oldRoom = clientData.currentRoom;
        
        // Quitter l'ancien salon
        socket.leave(oldRoom);
        this.roomCounts[oldRoom] = Math.max(0, this.roomCounts[oldRoom] - 1);
        
        // Rejoindre le nouveau salon
        socket.join(roomName);
        this.roomCounts[roomName]++;
        
        // Mettre à jour les données du client
        clientData.previousRoom = oldRoom;
        clientData.currentRoom = roomName;
        this.socketConnected.set(clientId, clientData);
        
        // Informer le client qu'il a changé de salon
        socket.emit('room-changed', { 
          room: roomName,
          usersInRoom: this.roomCounts[roomName] 
        });
        
        // Diffuser les mises à jour des nombres de clients
        this.broadcastClientCount();
        
        console.log(`${clientId} a changé de salon: ${oldRoom} -> ${roomName}`);
      });
      
      // Gérer les messages
      socket.on('message', (data) => {
        console.log(`Message reçu de ${clientId} dans le salon ${data.room || 'inconnu'}:`, data.message);
        
        const clientData = this.socketConnected.get(clientId);
        if (!clientData) return;
        
        const room = data.room || clientData.currentRoom;
        
        // Diffuser uniquement dans le salon concerné
        socket.to(room).emit('chat-message', {
          ...data,
          room: room
        });
      });
      
      // Gérer le feedback de frappe
      socket.on("feedback", (data) => {
        const clientData = this.socketConnected.get(clientId);
        if (!clientData) return;
        
        // Diffuser uniquement dans le salon actuel
        socket.to(clientData.currentRoom).emit('feedback', data);
      });
    }
    
    // Diffuser le nombre de clients connectés
    broadcastClientCount() {
      const uniqueClients = new Set([...this.ipAddresses.keys()]).size;
      console.log(`Nombre total de clients uniques: ${uniqueClients}`);
      
      // Diffuser le nombre total
      this.io.emit('clients-total', uniqueClients);
      
      // Diffuser le nombre par salon
      this.io.emit('room-stats', this.roomCounts);
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
            
            // Mettre à jour le compteur de salon
            const room = clientData.currentRoom;
            this.roomCounts[room]--;
            
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
          this.broadcastClientCount();
        }
      }, 5 * 60 * 1000); // Vérifier toutes les 5 minutes
    }
}
  
module.exports = SocketService;