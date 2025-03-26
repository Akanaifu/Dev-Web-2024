const express = require('express');
const app = express();
const PORT = process.env.PORT || 80; // port du serveur
const HOST = process.env.HOST || '54.36.183.127'; // adresse du serveur

// Middleware to parse JSON requests
app.use(express.json());

// Import routes
const routes = require('./routes/index');

// Use routes
app.use('/api', routes);

// Start the server
app.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
});