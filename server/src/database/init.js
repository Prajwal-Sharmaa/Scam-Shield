// Uses the built-in node:sqlite module (Node.js 22.5+)
// No native compilation needed — part of Node.js core.
const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'scamshield.db');

let db;

function getDb() {
  if (!db) {
    // Ensure directory exists
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    db = new DatabaseSync(DB_PATH);
    db.exec('PRAGMA journal_mode = WAL;');
    db.exec('PRAGMA foreign_keys = ON;');
  }
  return db;
}

function initializeDatabase() {
  const database = getDb();

  database.exec(`
    CREATE TABLE IF NOT EXISTS scans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      scan_type TEXT NOT NULL,
      source_type TEXT,
      original_content TEXT NOT NULL,
      sender TEXT,
      domain TEXT,
      risk_score INTEGER NOT NULL DEFAULT 0,
      risk_level TEXT NOT NULL,
      category TEXT,
      confidence INTEGER DEFAULT 0,
      explanation TEXT,
      recommendations TEXT,
      red_flags TEXT,
      score_breakdown TEXT,
      highlighted_content TEXT,
      is_false_positive INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  console.log('Database initialized successfully.');
}

module.exports = { getDb, initializeDatabase };
