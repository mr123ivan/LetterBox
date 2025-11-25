// server.js
const express = require('express');
const dotenv = require('dotenv');
const db = require('./config/db'); // Import the database connection

dotenv.config(); // Load .env file

const app = express();

//imports
const userRoutes = require('./routes/userRoutes');
const letterRoutes = require('./routes/letterRoutes');
const openAiRoutes = require('./routes/openAiRoutes');
const { errorHandler } = require('./middleware/errorHandler');

// Middleware to parse JSON bodies
app.use(express.json()); 

// Placeholder for routes (will be added in Step 3 & 4)
app.use('/api/users', userRoutes);
app.use('/api/letters', letterRoutes);
app.use('/api/ai', openAiRoutes);
app.use(errorHandler);


const PORT = process.env.PORT || 5001;

app.listen(
    PORT, 
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);