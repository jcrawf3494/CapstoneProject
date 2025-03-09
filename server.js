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
        console.error(' Error connecting to PostgreSQL:', err.stack);
    } else {
        console.log(' Connected to PostgreSQL successfully!');
    }
    release(); // Release the connection
});

// **GET /api/fosters** - Fetch all fosters from the database
app.get('/api/fosters', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM fosters ORDER BY id ASC'); // Fetch all records
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching fosters:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// **POST /api/fosters** - Add a new foster/pet to the database
app.post('/api/fosters', async (req, res) => {
    try {
        const { name, phone_number, email, pet_name, preferred_contact_time } = req.body;

        if (!name || !phone_number || !email || !pet_name || !preferred_contact_time) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const result = await pool.query(
            `INSERT INTO fosters (name, phone_number, email, pet_name, preferred_contact_time) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [name, phone_number, email, pet_name, preferred_contact_time]
        );

        console.log("New foster added:", result.rows[0]);
        res.status(201).json(result.rows[0]); // Return the newly created entry
    } catch (error) {
        console.error('Error adding foster:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// **DELETE /api/fosters/:id** - Delete a foster entry
app.delete('/api/fosters/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM fosters WHERE id = $1 RETURNING *', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Foster not found" });
        }

        console.log("Foster deleted:", result.rows[0]);
        res.json({ message: "Foster deleted successfully", deletedFoster: result.rows[0] });
    } catch (error) {
        console.error(' Error deleting foster:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// **Test Route**
app.get('/', (req, res) => {
    res.send('Welcome to the AAUPR Backend API!');
});

// **Start Server**
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
