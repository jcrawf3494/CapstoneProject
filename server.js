require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8081;

// Middleware
app.use(bodyParser.json());

// Improved CORS Configuration
app.use(cors({
    origin: '*',  // Allow all origins for debugging (Change this in production)
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization'
}));

// PostgreSQL Connection Pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Test Database Connection (Better way)
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error(' Database connection failed:', err.stack);
    } else {
        console.log('Connected to PostgreSQL:', res.rows[0]);
    }
});

//  API Routes (Prefix with `/api`)
app.get('/api', (req, res) => {
    res.send('Welcome to the AAUPR Backend API!');
});

// Sample Route to Get All Profiles
app.get('/api/profiles', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM profiles');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching profiles:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//  Serve Frontend (React Native Web)
app.use(express.static(path.join(__dirname, 'web-build')));

// Only Serve Frontend for Non-API Routes
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
        return next(); // Skip serving frontend for API routes
    }
    res.sendFile(path.join(__dirname, 'web-build', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
