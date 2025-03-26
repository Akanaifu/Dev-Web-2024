const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080; // Port for the server
const HOST = process.env.HOST || '0.0.0.0'; // Bind to all interfaces

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