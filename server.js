require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');


const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(bodyParser.json());
app.use(cors({
    origin: ['http://localhost:8080', 'http://localhost:8081'], // Allow frontend requests (adjust later for deployment)
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization'
}));

// PostgreSQL Database Connection
const pool = new Pool({
    connectionString: "postgresql://adminuser:BestLife224%24@aaupre-db.postgres.database.azure.com:5432/postgres",
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

// Allowed preferred_contact_time values
const validContactTimes = ['7AM-10AM', '10AM-12PM', '12PM-2PM', '2PM-5PM', '5PM-8PM']


//  API Route to Fetch Profiles
app.get('/api/profiles', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM fosters');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching fosters:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// **POST /api/fosters** - Add a new foster/pet to the database
app.post('/api/profiles', async (req, res) => {
    try {

        console.log("Received data:", req.body)

        const { name, phone_number, email, pet_name, preferred_contact_time } = req.body;

        // Validate fields
        if (!name || !phone_number || !email || !pet_name || !preferred_contact_time) {
            return res.status(400).json({ error: "All fields are required" });
        }

        console.log("Preferred contact time:", preferred_contact_time);
        console.log("Valid options:", validContactTimes)

        // Validate preferred_contact_time
        if (!validContactTimes.includes(preferred_contact_time)) {
            return res.status(400).json({ error: "Invalid preferred contact time. Allowed values: " + validContactTimes.join(', ') });
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
    console.log(` Server running on http://localhost:${PORT}`);
});
