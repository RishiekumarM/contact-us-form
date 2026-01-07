const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../contact_logs.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Add file_path column if it doesn't exist
    // reliable way: try to select it, if fails, add it.
    // Or just run ALTER TABLE and catch "dublicate column name" error (simple way)

    db.run(`ALTER TABLE contact_logs ADD COLUMN file_path TEXT`, (err) => {
        if (err) {
            if (err.message.includes('duplicate column name')) {
                console.log('Column "file_path" already exists.');
            } else {
                console.error('Error adding column:', err.message);
            }
        } else {
            console.log('Column "file_path" added successfully.');
        }
    });
});

db.close();
