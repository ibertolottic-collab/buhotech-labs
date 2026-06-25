const db = require('./db');

try {
  db.exec('ALTER TABLE questions ADD COLUMN verification_options TEXT;');
  db.exec('ALTER TABLE questions ADD COLUMN verification_answer TEXT;');
  db.exec('ALTER TABLE questions ADD COLUMN rescue_options TEXT;');
  db.exec('ALTER TABLE questions ADD COLUMN rescue_answer TEXT;');
  console.log('Columns added successfully.');
} catch (e) {
  console.log('Columns may already exist or error occurred:', e.message);
}
