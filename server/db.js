const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'antigravity.db'));

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    xp INTEGER DEFAULT 0,
    hearts INTEGER DEFAULT 10,
    streak_days INTEGER DEFAULT 0,
    unlocked_module INTEGER DEFAULT 1,
    last_played DATE
  );

  CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    phase TEXT,
    type TEXT,
    text TEXT,
    options TEXT,
    correct_answer TEXT,
    image_filename TEXT,
    min_reading_time_ms INTEGER,
    expected_time_ms INTEGER,
    verification_text TEXT,
    verification_options TEXT,
    verification_answer TEXT,
    rescue_text TEXT,
    rescue_options TEXT,
    rescue_answer TEXT,
    verification_image_filename TEXT,
    rescue_image_filename TEXT
  );

  CREATE TABLE IF NOT EXISTS user_responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    question_id TEXT,
    is_correct BOOLEAN,
    response_time_ms INTEGER,
    behavior_flag TEXT,
    sub_question_type TEXT DEFAULT 'main',
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(question_id) REFERENCES questions(id)
  );
`);

// Safely add column if upgrading from old schema
try {
  db.exec(`ALTER TABLE user_responses ADD COLUMN sub_question_type TEXT DEFAULT 'main'`);
} catch (e) {
  // Column already exists, ignore
}

module.exports = db;
