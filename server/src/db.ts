import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(__dirname, '../../photos.db');
const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS albums (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    date TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    album_id INTEGER NOT NULL,
    filename TEXT NOT NULL,
    FOREIGN KEY (album_id) REFERENCES albums (id)
  );
`);

export default db;
