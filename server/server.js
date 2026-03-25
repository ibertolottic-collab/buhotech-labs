require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

// --- AUTO-SEED DATA IF EMPTY (FOR CLOUD) ---
try {
  const count = db.prepare('SELECT COUNT(*) as count FROM questions').get().count;
  if (count === 0) {
    console.log('--- DATABASE EMPTY: SEEDING INITIAL DATA ---');
    require('./seed');
  }
} catch (e) {
  console.error('Seed check failed, skipping...', e.message);
}

const { generateQuestions } = require('./ai_generator');

const app = express();
app.use(cors());
app.use(express.json());

// Servir la carpeta estática de imágenes
app.use('/images', express.static(path.join(__dirname, '../Imagenes')));
app.use(express.json());

// Users Endpoints
app.post('/api/users/login', (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Username required' });
  
  let user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user) {
    const id = Date.now().toString(); // simple ID generator for prototype
    db.prepare('INSERT INTO users (id, username, xp, hearts, streak_days, unlocked_module) VALUES (?, ?, 0, 50, 0, 1)').run(id, username);
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  } else {
    // Reload hearts for testing easily
    db.prepare('UPDATE users SET hearts = MAX(hearts, 50) WHERE id = ?').run(user.id);
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
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
    try { q.options = JSON.parse(q.options); } catch(e) {}
    try { if (q.verification_options) q.verification_options = JSON.parse(q.verification_options); } catch(e) {}
    try { if (q.rescue_options) q.rescue_options = JSON.parse(q.rescue_options); } catch(e) {}
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
  const { user_id, question_id, is_correct, response_time_ms, sub_question_type = 'main', selected_option_id } = req.body;
  
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
    INSERT INTO user_responses (user_id, question_id, is_correct, response_time_ms, behavior_flag, sub_question_type, selected_option_id) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(user_id, question_id, is_correct ? 1 : 0, response_time_ms, behavior_flag, sub_question_type, selected_option_id || null);

  // Update user state if behavior was normal or thinking
  let user = db.prepare('SELECT * FROM users WHERE id = ?').get(user_id);
  
  if (is_correct && behavior_flag !== 'FAST_RANDOM') {
    db.prepare('UPDATE users SET xp = xp + 10 WHERE id = ?').run(user_id);
  } else if (!is_correct || behavior_flag === 'FAST_RANDOM') {
    // Punish hearts for wrong answer or random guessing
    db.prepare('UPDATE users SET hearts = MAX(0, hearts - 1) WHERE id = ?').run(user_id);
  }
  
  user = db.prepare('SELECT * FROM users WHERE id = ?').get(user_id);
  
  const is_main = sub_question_type === 'main';
  let fbText = "";
  if (is_correct) {
      fbText = is_main && question.verification_text ? question.verification_text : "¡Perfecto! Has ganado 10 XP adicionales al dominar el concepto.";
  } else {
      fbText = is_main && question.rescue_text ? question.rescue_text : "No te preocupes. ¡Sigue investigando y lo lograrás!";
  }

  // Return response with scaffolded feedback
  res.json({
    success: true,
    user,
    feedback: {
      type: is_correct ? (is_main ? 'VERIFICATION' : 'PRAISE') : (is_main ? 'RESCUE' : 'ENCOURAGE'),
      text: fbText,
      xp_gained: behavior_flag !== 'FAST_RANDOM' ? 10 : 0
    },
    behavior: behavior_flag
  });
});

// AI Question Generation Endpoint
app.post('/api/questions/generate', async (req, res) => {
  const { topic, count } = req.body;
  if (!topic) return res.status(400).json({ error: 'Topic is required' });
  
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
  }

  try {
    const generatedQuestions = await generateQuestions(topic, count || 3);
    
    // Insert them into the DB
    const insert = db.prepare(`
      INSERT OR IGNORE INTO questions 
      (id, phase, type, text, options, correct_answer, image_filename, min_reading_time_ms, expected_time_ms, verification_text, verification_options, verification_answer, verification_image_filename, rescue_text, rescue_options, rescue_answer, rescue_image_filename)
      VALUES (@id, @phase, @type, @text, @options, @correct_answer, @image_filename, @min_reading_time_ms, @expected_time_ms, @verification_text, @verification_options, @verification_answer, @verification_image_filename, @rescue_text, @rescue_options, @rescue_answer, @rescue_image_filename)
    `);

    const insertMany = db.transaction((qs) => {
      for (const q of qs) {
        // Ensure ID uniqueness
        q.id = "gen_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
        
        insert.run({
          ...q,
          options: JSON.stringify(q.options),
          verification_options: q.verification_options ? JSON.stringify(q.verification_options) : null,
          rescue_options: q.rescue_options ? JSON.stringify(q.rescue_options) : null,
        });
      }
    });
    
    insertMany(generatedQuestions);
    
    res.json({ success: true, count: generatedQuestions.length, data: generatedQuestions });
  } catch (err) {
    console.error("Endpoint AI Error:", err);
    res.status(500).json({ error: 'Failed to generate questions using AI.' });
  }
});
app.get('/api/users/:id/report', (req, res) => {
  const { id } = req.params;
  try {
    let history;
    try {
      history = db.prepare(`
        SELECT r.is_correct, r.sub_question_type, q.text as main_text, q.verification_text, q.rescue_text, q.phase 
        FROM user_responses r 
        JOIN questions q ON r.question_id = q.id 
        WHERE r.user_id = ?
        ORDER BY r.id ASC
      `).all(id);
    } catch (sqlErr) {
      // Fallback: sub_question_type column might not exist in old DBs
      console.warn('Fallback query without sub_question_type:', sqlErr.message);
      history = db.prepare(`
        SELECT r.is_correct, 'main' as sub_question_type, q.text as main_text, q.verification_text, q.rescue_text, q.phase 
        FROM user_responses r 
        JOIN questions q ON r.question_id = q.id 
        WHERE r.user_id = ?
        ORDER BY r.id ASC
      `).all(id);
    }
    
    const formatted = history.map(item => {
      let text = item.main_text;
      if (item.sub_question_type === 'verification' && item.verification_text) text = item.verification_text;
      if (item.sub_question_type === 'rescue' && item.rescue_text) text = item.rescue_text;
      return {
        phase: item.phase,
        text: text || 'Pregunta sin texto',
        isCorrect: !!item.is_correct
      };
    });
    res.json(formatted);
  } catch (err) {
    console.error('Report endpoint error:', err);
    res.status(500).json({ error: 'Failed to fetch report.' });
  }
});

// Admin Export Endpoint (Wide Format - 1 Fila por Alumno)
app.get('/api/admin/export', (req, res) => {
  try {
    const rawResponses = db.prepare(`
        SELECT 
          u.username as usuario,
          u.xp as xp_acumulada_total,
          u.hearts as vidas_restantes_total,
          u.unlocked_module as modulo_max_alcanzado,
          u.streak_days as racha_dias,
          q.phase as modulo_pregunta,
          r.question_id,
          r.selected_option_id,
          CASE 
            WHEN r.is_correct = 1 THEN 'Correcto'
            ELSE 'Incorrecto' 
          END as resultado_respuesta,
          CASE 
            WHEN r.behavior_flag = 'FAST_RANDOM' THEN 'Azar Rápido'
            WHEN r.behavior_flag = 'SEARCHING_THINKING' THEN 'Pensamiento Crítico'
            ELSE 'Normal' 
          END as perfil_comportamiento,
          r.response_time_ms as tiempo_respuesta_ms,
          r.is_correct
        FROM user_responses r
        JOIN users u ON r.user_id = u.id
        JOIN questions q ON r.question_id = q.id
        WHERE u.username != 'admin' AND u.username != 'admin-buhotech'
        ORDER BY r.timestamp ASC
    `).all();

    if (!rawResponses.length) {
       return res.status(404).send("No hay suficientes datos de alumnos reales para exportar.");
    }

    const usersMap = {};
    const allQuestionIds = new Set();
    const phaseNames = ['Fase 1: Los Archivos de la Humanidad', 'Fase 2: El Mapa del Detective', 'Fase 3: Las Lentes del Investigador', 'Fase 4: La Sospecha y el Campo', 'Fase 5: El Jefe Final'];

    rawResponses.forEach(row => {
        const u = row.usuario;
        if (!usersMap[u]) {
            usersMap[u] = {
                xp: row.xp_acumulada_total,
                vidas: row.vidas_restantes_total,
                modulo_max: row.modulo_max_alcanzado,
                racha: row.racha_dias,
                global_correct: 0,
                global_total: 0,
                global_azar: 0,
                phases: {},
                questions: {}
            };
            phaseNames.forEach(p => {
               usersMap[u].phases[p] = { total: 0, correct: 0, time: 0, azar: 0 };
            });
        }
        
        const p = row.modulo_pregunta;
        usersMap[u].global_total += 1;
        usersMap[u].global_correct += row.is_correct;
        if (row.perfil_comportamiento === 'Azar Rápido') usersMap[u].global_azar += 1;
        
        if (usersMap[u].phases[p]) {
            usersMap[u].phases[p].total += 1;
            usersMap[u].phases[p].correct += row.is_correct;
            usersMap[u].phases[p].time += row.tiempo_respuesta_ms;
            if (row.perfil_comportamiento === 'Azar Rápido') usersMap[u].phases[p].azar += 1;
        }

        // Se guarda el último intento cronológico para cada ID de pregunta
        usersMap[u].questions[row.question_id] = {
            resultado: row.resultado_respuesta,
            tiempo: row.tiempo_respuesta_ms,
            perfil: row.perfil_comportamiento,
            opcion_elegida: row.selected_option_id
        };
        allQuestionIds.add(row.question_id);
    });

    const sortedQids = Array.from(allQuestionIds).sort();

    const headers = ['Usuario', 'XP_Total', 'Vidas_Restantes', 'Modulo_Max_Alcanzado', 'Racha_Dias', 'Nota_Vigesimal_Final_Global', 'Algoritmo_Desercion_Churn', 'Algoritmo_Engagement', 'Algoritmo_Perfil_Cognitivo'];
    
    phaseNames.forEach((p, idx) => {
        const m = `Fase_${idx+1}`;
        headers.push(`${m}_Misiones_Jugadas`);
        headers.push(`${m}_Nota_Vigesimal_Calculada`);
        headers.push(`${m}_Total_Aciertos`);
        headers.push(`${m}_Tiempo_Dedicado_ms`);
        headers.push(`${m}_Penalidades_Azar_Rapido`);
    });

    sortedQids.forEach(qid => {
        headers.push(`[${qid}]_Resultado`);
        headers.push(`[${qid}]_Opcion_Elegida`);
        headers.push(`[${qid}]_Tiempo_ms`);
        headers.push(`[${qid}]_Comportamiento`);
    });

    const csvRows = [headers.join(',')];

    Object.keys(usersMap).forEach(uname => {
        const u = usersMap[uname];
        
        let globalNota = '';
        if (u.global_total > 0) {
            globalNota = Math.round(10 + (u.global_correct / u.global_total) * 10);
        }
        
        let churn = 'Activo';
        if (u.vidas <= 0) churn = 'Abandonó (Frustración)';
        else if (u.modulo_max >= 5) churn = 'Completó Búhotech';
        
        let engagement = 'Bajo (0-1 días)';
        if (u.racha === 2) engagement = 'Medio (2 días)';
        else if (u.racha > 2) engagement = 'Alto (Hábito Formado)';
        
        let perfil = 'Normal / Equilibrado';
        if (u.global_total > 0) {
            const azarRatio = u.global_azar / u.global_total;
            if (azarRatio >= 0.3) perfil = 'Impulsivo (Adivina a menudo)';
            else if (azarRatio <= 0.05) perfil = 'Reflexivo (Cauteloso)';
        }

        const row = [`"${uname}"`, u.xp, u.vidas, u.modulo_max, u.racha, globalNota, `"${churn}"`, `"${engagement}"`, `"${perfil}"`];

        phaseNames.forEach(p => {
            const mData = u.phases[p];
            let nota = '';
            if (mData.total > 0) {
                nota = Math.round(10 + (mData.correct / mData.total) * 10);
            }
            row.push(mData.total, nota, mData.correct, mData.time, mData.azar);
        });

        sortedQids.forEach(qid => {
            if (u.questions[qid]) {
                const qd = u.questions[qid];
                row.push(`"${qd.resultado}"`, `"${qd.opcion_elegida || ''}"`, qd.tiempo, `"${qd.perfil}"`);
            } else {
                row.push('', '', '', '');
            }
        });

        csvRows.push(row.join(','));
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="buhotech_investigacion_wide.csv"');
    res.send("\uFEFF" + csvRows.join('\r\n'));
  } catch (err) {
    console.error('Export endpoint error:', err);
    res.status(500).json({ error: 'Failed to generate CSV.' });
  }
});

// Serve compiled frontend in production
const clientBuildPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientBuildPath));
app.get('{*path}', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
