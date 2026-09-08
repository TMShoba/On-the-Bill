import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "..", "data", "onthebill.db");

import fs from "fs";
const dataDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

// Performance & safety
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS artists (
    id TEXT PRIMARY KEY,
    stage_name TEXT NOT NULL,
    genre TEXT NOT NULL,
    location TEXT NOT NULL,
    rate INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    bio TEXT DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('client', 'artist')),
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    artist_id TEXT NOT NULL,
    artist_name TEXT NOT NULL,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    event_date TEXT NOT NULL,
    venue TEXT DEFAULT '',
    message TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending'
      CHECK(status IN ('pending', 'confirmed', 'declined')),
    created_at TEXT NOT NULL,
    FOREIGN KEY (artist_id) REFERENCES artists(id)
  );
`);

export default db;
