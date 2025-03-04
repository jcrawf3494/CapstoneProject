require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 8081;

// Middleware
app.use(bodyParser.json());
app.use(cors({
    origin: ['http://localhost:8081'], // Allow frontend requests (adjust later for deployment)
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization'
}));

// PostgreSQL Database Connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Test Database Connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Database connection failed:', err.stack);
    } else {
        console.log('Connected to PostgreSQL:', res.rows[0]);
    }
});

//  API Route to Fetch Bios
app.get('/api/profiles', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM fosters');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching fosters:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Test Route
app.get('/api', (req, res) => {
    res.send('Welcome to the AAUPR Backend API!');
});

// Start the Server
app.listen(PORT, () => {
    console.log(` Server running on http://localhost:${PORT}`);
});
