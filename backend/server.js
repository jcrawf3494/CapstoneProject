require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args)); // For Node 18+

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json()); // replaced body-parser
app.use(cors({
  origin: [
    'http://localhost:8080',
    'http://localhost:8081',
    'https://aaupetrescue-hta0efhnh2gtgrcv.eastus2-01.azurewebsites.net' // Azure deployment URL
  ],
  methods: 'GET,POST,PUT,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type,Authorization'
}));

// PostgreSQL Database Connection
const pool = new Pool({
  connectionString: process.env.Database_URL,
  ssl: { rejectUnauthorized: false }
});

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Route: send photo request email
app.post('/api/send-photo-request', async (req, res) => {
  const { recipientEmail, fosterName, petName } = req.body;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipientEmail,
    subject: `Photo Request for ${petName}`,
    text: `Hi ${fosterName},\n\nThanks for completing the foster interview! You mentioned you don't have any photos of ${petName}.\n\nPlease reply to this email to schedule a photography shoot with the team at your convenience.\n\nThank you!\nAngels Among Us Pet Rescue`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Photo request email sent!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email.' });
  }
});

app.post('/api/check-photo-request', async (req, res) => {
  const { foster } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM fosters WHERE call_id = $1',
      [foster.call_id]
    );

    const dbFoster = result.rows[0];

    if (dbFoster && dbFoster.photographyneeded === true) {
      const {
        id,
        name: fosterName,
        email,
        pet_name: petName,
        preferred_contact_time: contactTime
      } = dbFoster;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'angelsphotographyemail@gmail.com',
        subject: `Photography Needed for ${petName}`,
        text: `📸 New Photography Request\n\nFoster Name: ${fosterName}\nFoster Email: ${email}\nFoster ID: ${id}\nPet Name: ${petName}\nPreferred Contact Time: ${contactTime}\n\nPlease reach out to the foster to schedule a photoshoot for their pet!\n\nThanks!\nAngels Among Us Pet Rescue`
      };

      await transporter.sendMail(mailOptions);

      await pool.query(
        'UPDATE fosters SET photographyneeded = false WHERE call_id = $1',
        [dbFoster.call_id]
      );

      res.status(200).json({ message: 'Photography team notified & flag reset' });
    } else {
      res.status(200).json({ message: 'No email needed – photographyNeeded is false or missing' });
    }
  } catch (error) {
    console.error('Error in /api/check-photo-request route:', error);
    res.status(500).json({ error: 'Server error while processing transcription' });
  }
});

// Route: test email functionality
app.get('/api/test-email', async (req, res) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: 'Test Email from AAUPR Backend',
    text: 'Hi there! This is a test email sent from your backend using Nodemailer. If you received this, your setup is working!'
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Test email sent');
    res.status(200).json({ message: 'Test email sent successfully!' });
  } catch (error) {
    console.error('Failed to send test email:', error);
    res.status(500).json({ error: 'Failed to send test email.' });
  }
});

// Test DB
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
  } else {
    console.log('Connected to PostgreSQL:', res.rows[0]);
  }
});

// Allowed values
const validContactTimes = ['7AM-10AM', '10AM-12PM', '12PM-2PM', '2PM-5PM', '5PM-8PM'];

// GET profiles
app.get('/api/profiles', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM fosters');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching fosters:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST profile
app.post('/api/profiles', async (req, res) => {
  try {
    const { name, phone_number, email, pet_name, preferred_contact_time } = req.body;

    if (!name || !phone_number || !email || !pet_name || !preferred_contact_time) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!validContactTimes.includes(preferred_contact_time)) {
      return res.status(400).json({ error: "Invalid preferred contact time" });
    }

    const result = await pool.query(
      `INSERT INTO fosters (name, phone_number, email, pet_name, preferred_contact_time) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, phone_number, email, pet_name, preferred_contact_time]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding foster:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// DELETE profile
app.delete('/api/fosters/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM fosters WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Foster not found" });
    }

    res.json({ message: "Foster deleted successfully", deletedFoster: result.rows[0] });
  } catch (error) {
    console.error('Error deleting foster:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the AAUPR Backend API!');
});

// Automatic background check every 5 minutes
setInterval(async () => {
  try {
    const result = await pool.query(
      'SELECT * FROM fosters WHERE photographyneeded = true'
    );

    for (const foster of result.rows) {
      const {
        id,
        name: fosterName,
        email,
        pet_name: petName,
        phone_number: phone,
        preferred_contact_time: contactTime,
        call_id
      } = foster;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'angelsphotographyemail@gmail.com',
        subject: `Photography Needed for ${petName}`,
        text: `Hello Photography Team,\n\nA foster has completed an interview and indicated they do not have photos of their pet.\n\nFoster Info:\n• Name: ${fosterName}\n• Email: ${email}\n• Phone: ${phone}\n• Foster ID: ${id}\n• Pet Name: ${petName}\n• Preferred Contact Time: ${contactTime}\n\nPlease reach out to schedule a photography session!\n\nThank you,\nAngels Among Us Pet Rescue`
      };

      await transporter.sendMail(mailOptions);
      console.log(`Email sent for foster ID ${id} - ${fosterName}`);

      await pool.query(
        'UPDATE fosters SET photographyneeded = false, email_sent = true WHERE call_id = $1',
        [call_id]
      );
    }

  } catch (error) {
    console.error('Error in background photography email job:', error);
  }
}, 300000); // 5 minutes

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
