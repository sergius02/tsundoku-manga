import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = process.env.DATA_DIR || __dirname;
const DB_PATH = join(DATA_DIR, 'tsundoku.db');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS mangas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT,
    publisher TEXT,
    cover_url TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS volumes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    manga_id INTEGER NOT NULL,
    isbn TEXT,
    title TEXT,
    volume_number INTEGER,
    status TEXT DEFAULT 'unread' CHECK(status IN ('unread', 'reading', 'read')),
    acquired BOOLEAN DEFAULT false,
    cover_url TEXT,
    FOREIGN KEY (manga_id) REFERENCES mangas(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_volumes_manga_id ON volumes(manga_id);

  CREATE TABLE IF NOT EXISTS api_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    api_name TEXT UNIQUE NOT NULL,
    enabled INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS auth_sessions (
    id TEXT PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    user_agent TEXT
  );
`);

export default db;