require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const { generateQuestions } = require('./ai_generator');

const app = express();
app.use(cors());
app.use(express.json());

// Servir la carpeta estática de imágenes
// Servir la carpeta estática de imágenes
app.use('/images', express.static(path.join(__dirname, '../Imagenes')));

// --- AUTO-SEED DATA IF EMPTY (FOR CLOUD) ---
const seedDatabase = async () => {
  if (!db) return; // If db is not initialized
  try {
    const snapshot = await db.collection('questions').limit(1).get();
    if (snapshot.empty) {
      console.log('--- DATABASE EMPTY: SEEDING INITIAL DATA ---');
      require('./seed');
    }
  } catch (e) {
    console.error('Seed check failed, skipping...', e.message);
  }
};
seedDatabase();

// Users Endpoints
app.post('/api/users/login', async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Username required' });
  
  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('username', '==', username).limit(1).get();
    
    let user;
    if (snapshot.empty) {
      const id = Date.now().toString(); // simple ID generator for prototype
      user = {
        id,
        username,
        xp: 0,
        hearts: 50,
        streak_days: 0,
        unlocked_module: 1,
        last_played: new Date().toISOString()
      };
      await usersRef.doc(id).set(user);
    } else {
      user = snapshot.docs[0].data();
      // Reload hearts for testing easily
      const newHearts = Math.max(user.hearts || 0, 50);
      await usersRef.doc(user.id).update({ hearts: newHearts });
      user.hearts = newHearts;
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const doc = await db.collection('users').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'User not found' });
    res.json(doc.data());
  } catch (err) {
    res.status(500).json({ error: 'Error fetching user' });
  }
});

// Questions Endpoints
app.get('/api/questions', async (req, res) => {
  const { phase } = req.query;
  try {
    let snapshot;
    if (phase) {
      snapshot = await db.collection('questions').where('phase', '==', phase).get();
    } else {
      snapshot = await db.collection('questions').get();
    }
    
    const questions = [];
    snapshot.forEach(doc => {
      const q = doc.data();
      // Parse options if they are strings
      try { if (typeof q.options === 'string') q.options = JSON.parse(q.options); } catch(e) {}
      try { if (typeof q.verification_options === 'string') q.verification_options = JSON.parse(q.verification_options); } catch(e) {}
      try { if (typeof q.rescue_options === 'string') q.rescue_options = JSON.parse(q.rescue_options); } catch(e) {}
      questions.push(q);
    });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching questions' });
  }
});

app.post('/api/users/:id/complete_module', async (req, res) => {
  const { id } = req.params;
  const { moduleNumber } = req.body;
  
  try {
    const userRef = db.collection('users').doc(id);
    const doc = await userRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'User not found' });
    
    const user = doc.data();
    if (moduleNumber >= user.unlocked_module) {
      await userRef.update({ unlocked_module: moduleNumber + 1 });
      user.unlocked_module = moduleNumber + 1;
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Error updating user' });
  }
});

// Response & Metric Logic
app.post('/api/responses', async (req, res) => {
  const { user_id, question_id, is_correct, response_time_ms, sub_question_type = 'main', selected_option_id } = req.body;
  
  try {
    const qDoc = await db.collection('questions').doc(question_id).get();
    if (!qDoc.exists) return res.status(404).json({ error: 'Question not found' });
    const question = qDoc.data();
    
    let behavior_flag = 'NORMAL';
    if (response_time_ms < question.min_reading_time_ms) {
      behavior_flag = 'FAST_RANDOM';
    } else if (response_time_ms > question.expected_time_ms) {
      behavior_flag = 'SEARCHING_THINKING';
    }

    // Record metrics
    await db.collection('user_responses').add({
      user_id,
      question_id,
      is_correct: !!is_correct,
      response_time_ms,
      behavior_flag,
      sub_question_type,
      selected_option_id: selected_option_id || null,
      timestamp: new Date().toISOString()
    });

    const userRef = db.collection('users').doc(user_id);
    const uDoc = await userRef.get();
    let user = uDoc.data();
    
    if (is_correct && behavior_flag !== 'FAST_RANDOM') {
      const newXp = (user.xp || 0) + 10;
      await userRef.update({ xp: newXp });
      user.xp = newXp;
    } else if (!is_correct || behavior_flag === 'FAST_RANDOM') {
      const newHearts = Math.max(0, (user.hearts || 0) - 1);
      await userRef.update({ hearts: newHearts });
      user.hearts = newHearts;
    }
    
    const is_main = sub_question_type === 'main';
    let fbText = "";
    if (is_correct) {
        fbText = is_main && question.verification_text ? question.verification_text : "¡Perfecto! Has ganado 10 XP adicionales al dominar el concepto.";
    } else {
        fbText = is_main && question.rescue_text ? question.rescue_text : "No te preocupes. ¡Sigue investigando y lo lograrás!";
    }

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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error saving response' });
  }
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
    const batch = db.batch();
    
    for (const q of generatedQuestions) {
      q.id = "gen_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
      const qRef = db.collection('questions').doc(q.id);
      
      batch.set(qRef, {
        ...q,
        options: JSON.stringify(q.options),
        verification_options: q.verification_options ? JSON.stringify(q.verification_options) : null,
        rescue_options: q.rescue_options ? JSON.stringify(q.rescue_options) : null,
      });
    }
    await batch.commit();
    res.json({ success: true, count: generatedQuestions.length, data: generatedQuestions });
  } catch (err) {
    console.error("Endpoint AI Error:", err);
    res.status(500).json({ error: 'Failed to generate questions using AI.' });
  }
});

app.get('/api/users/:id/report', async (req, res) => {
  const { id } = req.params;
  try {
    const responsesSnap = await db.collection('user_responses')
      .where('user_id', '==', id)
      .get();
      
    if (responsesSnap.empty) return res.json([]);
    
    // Sort locally to avoid needing a composite index in Firestore
    const sortedResponses = responsesSnap.docs
      .map(doc => doc.data())
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    const questionsSnap = await db.collection('questions').get();
    const questionsMap = {};
    questionsSnap.forEach(d => { questionsMap[d.id] = d.data(); });
    
    const formatted = [];
    sortedResponses.forEach(r => {
      const q = questionsMap[r.question_id];
      if (!q) return;
      
      let text = q.text;
      if (r.sub_question_type === 'verification' && q.verification_text) text = q.verification_text;
      if (r.sub_question_type === 'rescue' && q.rescue_text) text = q.rescue_text;
      
      formatted.push({
        phase: q.phase,
        text: text || 'Pregunta sin texto',
        isCorrect: !!r.is_correct
      });
    });
    
    res.json(formatted);
  } catch (err) {
    console.error('Report endpoint error:', err);
    res.status(500).json({ error: 'Failed to fetch report.' });
  }
});

// Admin Export Endpoint
app.get('/api/admin/export', async (req, res) => {
  try {
    const responsesSnap = await db.collection('user_responses').orderBy('timestamp', 'asc').get();
    const usersSnap = await db.collection('users').get();
    const questionsSnap = await db.collection('questions').get();
    
    const usersDict = {};
    usersSnap.forEach(d => { usersDict[d.id] = d.data(); });
    
    const questionsDict = {};
    questionsSnap.forEach(d => { questionsDict[d.id] = d.data(); });

    const usersMap = {};
    const allQuestionIds = new Set();
    const phaseNames = ['Fase 1: Los Archivos de la Humanidad', 'Fase 2: El Mapa del Detective', 'Fase 3: Las Lentes del Investigador', 'Fase 4: La Sospecha y el Campo', 'Fase 5: El Jefe Final'];

    responsesSnap.forEach(doc => {
      const row = doc.data();
      const uData = usersDict[row.user_id];
      if (!uData || uData.username === 'admin' || uData.username === 'admin-buhotech') return;
      
      const qData = questionsDict[row.question_id];
      if (!qData) return;
      
      const u = uData.username;
      if (!usersMap[u]) {
        usersMap[u] = {
            xp: uData.xp,
            vidas: uData.hearts,
            modulo_max: uData.unlocked_module,
            racha: uData.streak_days,
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
      
      const p = qData.phase;
      usersMap[u].global_total += 1;
      usersMap[u].global_correct += (row.is_correct ? 1 : 0);
      if (row.behavior_flag === 'FAST_RANDOM') usersMap[u].global_azar += 1;
      
      if (usersMap[u].phases[p]) {
          usersMap[u].phases[p].total += 1;
          usersMap[u].phases[p].correct += (row.is_correct ? 1 : 0);
          usersMap[u].phases[p].time += row.response_time_ms;
          if (row.behavior_flag === 'FAST_RANDOM') usersMap[u].phases[p].azar += 1;
      }

      let resultado_respuesta = row.is_correct ? 'Correcto' : 'Incorrecto';
      let perfil_comportamiento = 'Normal';
      if (row.behavior_flag === 'FAST_RANDOM') perfil_comportamiento = 'Azar Rápido';
      if (row.behavior_flag === 'SEARCHING_THINKING') perfil_comportamiento = 'Pensamiento Crítico';

      usersMap[u].questions[row.question_id] = {
          resultado: resultado_respuesta,
          tiempo: row.response_time_ms,
          perfil: perfil_comportamiento,
          opcion_elegida: row.selected_option_id
      };
      allQuestionIds.add(row.question_id);
    });

    if (Object.keys(usersMap).length === 0) {
       return res.status(404).send("No hay suficientes datos de alumnos reales para exportar.");
    }

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
app.use((req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
