const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Servir la carpeta estática de imágenes
app.use('/images', express.static(path.join(__dirname, '../../Imagenes')));
app.use(express.json());

// Users Endpoints
app.post('/api/users/login', (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Username required' });
  
  let user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user) {
    const id = Date.now().toString(); // simple ID generator for prototype
    db.prepare('INSERT INTO users (id, username, xp, hearts, streak_days, unlocked_module) VALUES (?, ?, 0, 10, 0, 1)').run(id, username);
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  }
  res.json(user);
});

app.get('/api/users/:id', (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  res.json(user);
});

// Questions Endpoints
app.get('/api/questions', (req, res) => {
  const { phase } = req.query;
  let questions;
  if (phase) {
    questions = db.prepare('SELECT * FROM questions WHERE phase = ?').all(phase);
  } else {
    questions = db.prepare('SELECT * FROM questions').all();
  }
  
  // parse the options JSON
  questions.forEach(q => {
    try {
        q.options = JSON.parse(q.options);
    } catch(e) {}
  });
  res.json(questions);
});

app.post('/api/users/:id/complete_module', (req, res) => {
  const { id } = req.params;
  const { moduleNumber } = req.body;
  
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  if (moduleNumber >= user.unlocked_module) {
    db.prepare('UPDATE users SET unlocked_module = ? WHERE id = ?').run(moduleNumber + 1, id);
  }
  
  const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  res.json(updatedUser);
});

// Response & Metric Logic
app.post('/api/responses', (req, res) => {
  const { user_id, question_id, is_correct, response_time_ms } = req.body;
  
  const question = db.prepare('SELECT * FROM questions WHERE id = ?').get(question_id);
  if (!question) return res.status(404).json({ error: 'Question not found' });
  
  let behavior_flag = 'NORMAL';
  if (response_time_ms < question.min_reading_time_ms) {
    behavior_flag = 'FAST_RANDOM'; // Too fast, likely random guessing
  } else if (response_time_ms > question.expected_time_ms) {
    behavior_flag = 'SEARCHING_THINKING'; // Valid, but took a long time
  }

  // Record metrics
  db.prepare(`
    INSERT INTO user_responses (user_id, question_id, is_correct, response_time_ms, behavior_flag) 
    VALUES (?, ?, ?, ?, ?)
  `).run(user_id, question_id, is_correct ? 1 : 0, response_time_ms, behavior_flag);

  // Update user state if behavior was normal or thinking
  let user = db.prepare('SELECT * FROM users WHERE id = ?').get(user_id);
  
  if (is_correct && behavior_flag !== 'FAST_RANDOM') {
    db.prepare('UPDATE users SET xp = xp + 10 WHERE id = ?').run(user_id);
  } else if (!is_correct || behavior_flag === 'FAST_RANDOM') {
    // Punish hearts for wrong answer or random guessing
    db.prepare('UPDATE users SET hearts = MAX(0, hearts - 1) WHERE id = ?').run(user_id);
  }
  
  user = db.prepare('SELECT * FROM users WHERE id = ?').get(user_id);
  
  // Return response with scaffolded feedback
  res.json({
    success: true,
    user,
    feedback: is_correct ? {
      type: 'VERIFICATION',
      text: question.verification_text,
      xp_gained: behavior_flag !== 'FAST_RANDOM' ? 10 : 0
    } : {
      type: 'RESCUE',
      text: question.rescue_text,
      hearts_lost: 1
    },
    behavior: behavior_flag
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
