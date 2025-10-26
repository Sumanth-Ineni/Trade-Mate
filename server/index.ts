// FIX: Changed imports to `import = require()` for CommonJS compatibility.
import express = require('express');
import cors = require('cors');
import dotenv = require('dotenv');
import apiRoutes = require('./routes');

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON request bodies

// API routes
app.use('/api', apiRoutes);

app.listen(port, () => {
  console.log(`Trade-Tracker Pro server is running on http://localhost:${port}`);
});
