const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../contact_logs.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    }
});

db.serialize(() => {
    db.each(`SELECT id, name, file_path FROM contact_logs ORDER BY id DESC LIMIT 10`, (err, row) => {
        if (err) {
            console.error('Error querying data:', err.message);
        } else {
            console.log(row);
        }
    });
});

db.close();
