require('dotenv').config(); // Load environment variables from .env

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// PostgreSQL Connection Pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Required for Azure PostgreSQL
    }
});

// Test Database Connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error connecting to PostgreSQL:', err.stack);
    } else {
        console.log('Connected to PostgreSQL successfully!');
    }
    release(); // Release the connection
});

// API Route to Fetch Fosters
app.get('/api/fosters', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM fosters'); // Fetch all records
        res.json(result.rows);
    } catch (error) {
        console.error('❌ Error fetching fosters:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Test Route
app.get('/', (req, res) => {
    res.send('Welcome to the AAUPR Backend API!');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
