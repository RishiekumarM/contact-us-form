const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Database connection
const dbPath = path.resolve(__dirname, 'contact_logs.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to SQLite database');
    }
});

// Validation helper
const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
};

// API Endpoint
app.post('/api/contact', (req, res) => {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: 'All fields are required.' });
    }
    if (!validateEmail(email)) {
        return res.status(400).json({ error: 'Invalid email format.' });
    }

    // Insert into DB
    const sql = `INSERT INTO contact_logs (name, email, subject, message) VALUES (?, ?, ?, ?)`;
    db.run(sql, [name, email, subject, message], function (err) {
        if (err) {
            console.error('Error inserting data:', err.message);
            return res.status(500).json({ error: 'Internal server error.' });
        }
        res.status(200).json({
            message: 'Message received successfully!',
            id: this.lastID
        });
    });
});

// Endpoint to get all logs (Admin)
app.get('/api/logs', (req, res) => {
    const sql = `SELECT * FROM contact_logs ORDER BY created_at DESC`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Error fetching logs:', err.message);
            return res.status(500).json({ error: 'Internal server error.' });
        }
        res.status(200).json(rows);
    });
});

// Endpoint to update log status (Admin)
app.patch('/api/logs/:id/status', (req, res) => {
    const { status } = req.body;
    const { id } = req.params;

    if (!['open', 'closed'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status. Must be "open" or "closed".' });
    }

    const sql = `UPDATE contact_logs SET status = ? WHERE id = ?`;
    db.run(sql, [status, id], function (err) {
        if (err) {
            console.error('Error updating status:', err.message);
            return res.status(500).json({ error: 'Internal server error.' });
        }
        res.status(200).json({ message: 'Status updated successfully.' });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
