const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../contact_logs.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to SQLite database');
    }
});

db.serialize(() => {
    db.run(`ALTER TABLE contact_logs ADD COLUMN status TEXT DEFAULT 'open'`, (err) => {
        if (err) {
            // Ignore error if column already exists (simplistic check)
            if (err.message.includes('duplicate column name')) {
                console.log('Column "status" already exists.');
            } else {
                console.error('Error adding column:', err.message);
            }
        } else {
            console.log('Column "status" added successfully.');
        }
    });
});

db.close();
