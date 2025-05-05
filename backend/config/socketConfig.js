const socketConfig = {
    cors: {
      origin: "http://localhost:4200",
      methods: ["GET", "POST"],
      credentials: true
    },
    pingTimeout: 5000,
    pingInterval: 10000,
    connectTimeout: 10000,
    transports: ['websocket']
  };
  
  module.exports = socketConfig;