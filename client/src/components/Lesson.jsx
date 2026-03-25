import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Heart, X } from 'lucide-react';

const API_URL = '/api';

// Advanced Web Audio API Synthesizer for Premium Game Sounds
const playSound = (type) => {
  try {
    const ctx = window.audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    window.audioCtx = ctx; // reuse context to avoid limit
    
    // Play a single note helper
    const playNote = (freq, type, startTime, duration, vol) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);
      
      // Envelope
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(vol, startTime + 0.05); // Attack
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration); // Decay
      
      osc.start(startTime);
      osc.stop(startTime + duration + 0.1);
    };

    const t = ctx.currentTime;
    
    if (type === 'success') {
      // Arpeggio: C5, E5, G5, C6 (Sparkly success chord)
      playNote(523.25, 'sine', t, 0.4, 0.1);
      playNote(659.25, 'sine', t + 0.1, 0.4, 0.1);
      playNote(783.99, 'sine', t + 0.2, 0.4, 0.1);
      playNote(1046.50, 'triangle', t + 0.3, 0.6, 0.15); // Accent end
    } else if (type === 'error') {
      // Dissonant descending sweep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      
      osc.frequency.setValueAtTime(300, t);
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.4); // Slide down
      
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.15, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      
      osc.start(t);
      osc.stop(t + 0.5);
    } else if (type === 'select') {
      // Quick satisfying 'bloop' pop
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(300, t + 0.08); // pitch punch
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.1, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      osc.start(t);
      osc.stop(t + 0.12);
    }
  } catch(e) { console.warn("Audio Context blocked", e); }
};

// Text to Speech
const speakText = (text) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  }
};

export default function Lesson({ user, phase, onEnd }) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null); // { type, text }
  const [selectedOption, setSelectedOption] = useState(null);
  const [subQuestionType, setSubQuestionType] = useState('main'); // 'main', 'verification', 'rescue'
  const [isExpanded, setIsExpanded] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [xpGained, setXpGained] = useState(0);
  const [responsesHistory, setResponsesHistory] = useState([]);
  
  const startTimeRef = useRef(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const url = phase ? `${API_URL}/questions?phase=${encodeURIComponent(phase)}` : `${API_URL}/questions`;
        const res = await axios.get(url);
        setQuestions(res.data);
        setLoading(false);
        startTimeRef.current = Date.now();
      } catch (err) {
        console.error(err);
        alert('Error fetching questions');
      }
    };
    fetchQuestions();
  }, [phase]);

  const handleSelectOption = (optionId) => {
    if (feedback || isChecking) return;
    playSound('select');
    setSelectedOption(optionId);
  };

  const handleCheck = async () => {
    if (!selectedOption || feedback || isChecking) return;
    
    setIsChecking(true);
    const responseTimeMs = Date.now() - startTimeRef.current;
    const currentQ = questions[currentIndex];
    
    let correctAns = currentQ.correct_answer;
    let trackText = currentQ.text;
    if (subQuestionType === 'verification') {
        correctAns = currentQ.verification_answer;
        trackText = currentQ.verification_text;
    }
    else if (subQuestionType === 'rescue') {
        correctAns = currentQ.rescue_answer;
        trackText = currentQ.rescue_text;
    }
    
    const isCorrect = selectedOption === correctAns;

    setResponsesHistory(prev => [
      ...prev,
      { text: trackText, isCorrect }
    ]);

    try {
      const res = await axios.post(`${API_URL}/responses`, {
        user_id: user.id,
        question_id: currentQ.id,
        is_correct: isCorrect,
        response_time_ms: responseTimeMs,
        sub_question_type: subQuestionType
      });

      setFeedback({
        isCorrect,
        behavior: res.data.behavior,
        ...res.data.feedback,
        updatedUser: res.data.user
      });
      
      if (isCorrect) playSound('success');
      else playSound('error');

    } catch (err) {
      console.error(err);
      alert('Error saving response');
    } finally {
      setIsChecking(false);
    }
  };

  const handleNext = async () => {
    let updatedUser = feedback.updatedUser;
    
    if (updatedUser.hearts <= 0) {
      alert('¡Te has quedado sin vidas! Vuelve a intentar más tarde.');
      onEnd(updatedUser);
      return;
    }

    const currentQ = questions[currentIndex];
    
    // Branching Logic
    if (subQuestionType === 'main') {
      if (feedback.isCorrect && currentQ.verification_options) {
        setSubQuestionType('verification');
        setFeedback(null);
        setSelectedOption(null);
        setIsExpanded(false);
        startTimeRef.current = Date.now();
        return;
      }
      if (!feedback.isCorrect && currentQ.rescue_options) {
        setSubQuestionType('rescue');
        setFeedback(null);
        setSelectedOption(null);
        setIsExpanded(false);
        startTimeRef.current = Date.now();
        return;
      }
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(curr => curr + 1);
      setSubQuestionType('main');
      setFeedback(null);
      setSelectedOption(null);
      setIsExpanded(false);
      startTimeRef.current = Date.now();
    } else {
      // Finished Phase
      try {
        const moduleNumber = parseInt(phase.match(/\d+/)[0]);
        const res = await axios.post(`${API_URL}/users/${user.id}/complete_module`, { moduleNumber });
        updatedUser = res.data;
      } catch (e) {
        console.error("Error unlocking next module:", e);
      }
      playSound('success');
      setFeedback({ updatedUser }); // store updated user but we will show the completion modal
      setIsCompleted(true);
    }
  };

  // Add generate trigger for AI
  const handleGenerateAI = async () => {
    if (!phase) return alert("Selecciona una fase primero.");
    setLoading(true);
    try {
      // call the new endpoint
      await axios.post(`${API_URL}/questions/generate`, { topic: phase, count: 3 });
      // reload questions
      const res = await axios.get(`${API_URL}/questions?phase=${encodeURIComponent(phase)}`);
      setQuestions(res.data);
      setCurrentIndex(0);
      setSubQuestionType('main');
    } catch (err) {
      console.error(err);
      alert('Error generando preguntas. ¿Has configurado GEMINI_API_KEY?');
    } finally {
      setLoading(false);
    }
  };

  const numQuestions = responsesHistory.length;
  const correctCount = responsesHistory.filter(r => r.isCorrect).length;
  const finalScore = numQuestions > 0 ? Math.round(10 + (correctCount / numQuestions) * 10) : 10;

  if (loading) return <div className="flex-1 flex justify-center items-center"><p className="font-bold animate-pulse text-brand-500 text-xl tracking-widest text-center">CARGANDO<br/>NUEVA MISIÓN...</p></div>;
  if (!questions.length) return (
    <div className="flex-1 p-6 flex flex-col items-center justify-center space-y-6 text-center">
      <h2 className="text-2xl font-black text-slate-800">¡Vaya! Nos quedamos sin misiones.</h2>
      <p className="text-slate-500 font-bold max-w-sm">No hay más preguntas disponibles en la base de datos para esta fase.</p>
      
      <div className="space-y-3 w-full max-w-xs">
        <button onClick={handleGenerateAI} className="w-full py-4 text-white text-lg font-black bg-linear-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2">
           <span>✨</span> GENERAR CON IA
        </button>
        <button onClick={() => onEnd(user)} className="w-full py-4 text-slate-500 font-bold bg-slate-100 rounded-2xl hover:bg-slate-200 transition-colors">
           Volver al Inicio
        </button>
      </div>
    </div>
  );

  const q = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;
  
  let currentText = q.text;
  let currentOptions = q.options;
  let currentCorrectAnswer = q.correct_answer;
  let currentImage = q.image_filename;
  
  if (subQuestionType === 'verification') {
    currentText = q.verification_text;
    currentOptions = q.verification_options;
    currentCorrectAnswer = q.verification_answer;
    if (q.verification_image_filename) currentImage = q.verification_image_filename;
  } else if (subQuestionType === 'rescue') {
    currentText = q.rescue_text;
    currentOptions = q.rescue_options;
    currentCorrectAnswer = q.rescue_answer;
    if (q.rescue_image_filename) currentImage = q.rescue_image_filename;
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative override-scroll pb-10">
      {/* Header Progress */}
      <div className="px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between z-10 bg-white shadow-sm border-b border-slate-100">
        <button onClick={() => onEnd(user)} className="text-slate-400 hover:text-slate-600 transition-colors shrink-0">
          <X size={28} />
        </button>
        <img src="/images/logo_nuevo.png" alt="Logo" className="w-10 h-10 object-contain mx-2" />
        <div className="flex-1 mx-2 h-5 bg-slate-200 rounded-full overflow-hidden relative">
          <div 
            className="absolute top-0 left-0 h-full bg-brand-500 transition-all duration-700 ease-out" 
            style={{ width: `${progress}%` }}
          >
            {/* Glossy inner bar effect */}
            <div className="absolute top-1 left-2 right-2 h-1 bg-white/30 rounded-full"></div>
          </div>
        </div>
        <div className="flex items-center text-accent-500 font-black text-xl animate-pulse-slow">
          <Heart className="fill-accent-500 mr-2 drop-shadow-sm" size={26} />
          {feedback ? feedback.updatedUser.hearts : user.hearts}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 pt-6 pb-32 overflow-y-auto override-scroll flex flex-col items-center">
        <h3 className="text-brand-600 font-black text-sm tracking-widest uppercase mb-4 opacity-80">{q.phase}</h3>
        
        {/* Scenario Image */}
        {currentImage && (
          <div 
             className="w-full max-w-sm aspect-video bg-indigo-50 rounded-2xl mb-8 border-4 border-slate-100 flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:scale-[1.02] hover:shadow-xl transition-all duration-300 relative group"
            onClick={() => setIsExpanded(true)}
          >
            <img 
               src={`/images/${encodeURIComponent(currentImage)}`} 
              alt={q.phase}
              className="object-cover w-full h-full transform transition duration-500 group-hover:scale-105"
              onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<span class="text-slate-400 font-bold">Sin Imagen</span>'; }}
            />
            <div className="absolute inset-x-0 bottom-0 bg-white/80 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all backdrop-blur-sm">
              <span className="text-brand-900 text-xs font-bold block text-center">🔍 Haz clic para ampliar</span>
            </div>
          </div>
        )}

        <h2 className="text-2xl sm:text-3xl font-black text-brand-900 mb-10 leading-snug tracking-tight text-center relative flex justify-center items-start gap-2">
          <span>{currentText}</span>
          <button 
             onClick={() => speakText(currentText)}
             className="text-slate-400 hover:text-brand-500 transition-colors p-1 shrink-0 mt-1"
             title="Escuchar en voz alta"
          >
             🔊
          </button>
        </h2>

        <div className="w-full space-y-4">
          {currentOptions.map(opt => {
            const isSelected = selectedOption === opt.id;
            let btnClass = "w-full text-left p-6 rounded-3xl border-4 font-bold transition-all relative overflow-hidden ";
            
            if (!feedback) {
              btnClass += isSelected 
                ? "border-brand-400 bg-brand-50 text-brand-800 scale-[1.02] shadow-md shadow-brand-100/50" 
                : "border-slate-200 bg-white hover:border-slate-300 text-slate-600 hover:bg-slate-50 shadow-sm active:scale-95";
            } else {
              const isCorrectOption = opt.id === currentCorrectAnswer;
              
              if (isCorrectOption) {
                btnClass += "border-success-400 bg-success-50 text-success-800 scale-[1.02] shadow-xl shadow-success-100";
              } else if (isSelected && !isCorrectOption) {
                btnClass += "border-accent-400 bg-accent-50 text-accent-800 opacity-90";
              } else {
                btnClass += "border-slate-100 bg-slate-50 text-slate-400 opacity-50";
              }
            }

            return (
              <button
                key={opt.id}
                onClick={() => handleSelectOption(opt.id)}
                disabled={feedback !== null || isChecking}
                className={btnClass}
              >
                {/* Visual marker inside button */}
                <span className="flex items-center space-x-4">
                   <span className={`shrink-0 w-8 h-8 rounded-full border-2 flex justify-center items-center font-black ${isSelected && !feedback ? 'border-brand-500 bg-brand-500 text-white' : 'border-slate-300 text-slate-400'}`}>
                     {opt.id}
                   </span>
                   <span className="text-lg leading-snug">{opt.text}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Check Action Button Container (Fixed at bottom) */}
      {!feedback && !isCompleted && (
        <div className={`absolute bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-sm border-t border-slate-100 shadow-[0_-10px_40px_-5px_rgba(0,0,0,0.05)] transition-all duration-300 z-50 ${selectedOption ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95 pointer-events-none'}`}>
           <button 
             onClick={handleCheck}
             disabled={isChecking}
             className="w-full max-w-2xl mx-auto py-4 text-xl font-black rounded-2xl shadow-lg transition-all active:scale-95 bg-brand-500 hover:bg-brand-600 text-white flex justify-center items-center"
           >
             {isChecking ? 'Comprobando...' : 'COMPROBAR'}
           </button>
        </div>
      )}

      {/* Image Modal Lightbox */}
      {isExpanded && currentImage && (
        <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <button 
            className="absolute top-6 right-6 text-white/50 hover:text-white bg-white/10 rounded-full p-3 transition-colors cursor-pointer hover:scale-110 active:scale-90"
            onClick={() => setIsExpanded(false)}
          >
            <X size={32} />
          </button>
          <img 
            src={`/images/${encodeURIComponent(currentImage)}`} 
            alt={q.phase}
            className="w-full h-auto max-w-5xl max-h-[90vh] object-contain rounded-xl shadow-2xl ring-1 ring-white/20"
          />
        </div>
      )}

      {/* Feedback Drawer */}
      {feedback && !isCompleted && (
        <div className={`absolute bottom-0 left-0 right-0 p-4 bg-white border-t-2 border-slate-100 shadow-[0_-10px_40px_-5px_rgba(0,0,0,0.1)] transition-all duration-300 z-50 ${feedback.isCorrect ? 'bg-success-100 ring-1 ring-success-200' : 'bg-accent-100 ring-1 ring-accent-200'}`}>
          <div className="flex items-start mb-6 px-2">
            <div className="mt-1 mr-4 shrink-0 bg-white p-1 rounded-full shadow-lg border-4 border-white/50 relative z-10 animate-bounce">
              <img src="/images/logo_nuevo.png" alt="Buhotech" className="w-16 h-16 object-contain rounded-full bg-white" />
            </div>
            
            <div className="relative flex-1 p-5 rounded-3xl shadow-md bg-white border border-slate-100">
              {/* Speech bubble tail */}
              <div className="absolute top-6 -left-3 w-6 h-6 bg-white rotate-45 transform origin-center border-l border-b border-slate-100"></div>
              <h3 className={`font-black text-2xl tracking-tight mb-2 ${feedback.isCorrect ? 'text-success-700' : 'text-accent-700'}`}>
                {feedback.type === 'VERIFICATION' ? 'Misión de Verificación' : 
                 feedback.type === 'RESCUE' ? 'Misión de Rescate' : 
                 feedback.isCorrect ? '¡Excelente Intuición!' : 'Incorrecto'}
              </h3>
              
              {feedback.behavior === 'FAST_RANDOM' && (
                <div className="bg-accent-200 text-accent-800 font-bold text-sm px-3 py-1.5 rounded-lg mb-3 inline-flex items-center">
                   ⚠️ Respondiste al azar. ¡Lee con calma!
                </div>
              )}
              {feedback.behavior === 'SEARCHING_THINKING' && feedback.isCorrect && (
                <div className="bg-brand-200 text-brand-800 font-bold text-sm px-3 py-1.5 rounded-lg mb-3 inline-flex items-center">
                   🧠 Pensaste bien tu respuesta.
                </div>
              )}
              
              <p className={`font-bold text-lg leading-snug ${feedback.isCorrect ? 'text-success-800' : 'text-accent-900'}`}>
                {feedback.text}
              </p>
            </div>
          </div>
          <button 
             onClick={handleNext}
             className={`w-full py-5 text-xl tracking-wide font-black rounded-2xl shadow-lg shadow-black/10 transition-transform active:scale-95 ${feedback.isCorrect ? 'bg-success-500 text-white' : 'bg-accent-500 hover:bg-accent-600 text-white'}`}
          >
             CONTINUAR
          </button>
        </div>
      )}

      {/* Results View */}
      {isCompleted && (
        <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col items-center p-6 sm:p-10 animate-in slide-in-from-bottom-8 duration-500 overflow-y-auto">
          <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col mb-10 pb-8">
            
            {/* Header */}
            <div className="bg-brand-600 p-8 flex flex-col items-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <img 
                 src="/images/logo_nuevo.png" 
                 className="w-24 h-24 object-contain rounded-full border-4 border-white/20 shadow-lg mb-4 animate-bounce bg-white z-10" 
                 alt="Level Complete"
              />
              <h1 className="text-4xl font-black text-white text-center drop-shadow-md tracking-tight z-10">Resultados Obtenidos</h1>
              <p className="text-brand-100 font-medium text-center z-10 tracking-widest uppercase mt-2">{phase}</p>
            </div>
            
            <div className="px-6 py-8 sm:px-10">
              
              {/* Score Highlight */}
              <div className="flex flex-col sm:flex-row gap-6 mb-10">
                <div className={`flex-1 p-6 rounded-2xl border-2 flex flex-col items-center justify-center text-center ${finalScore >= 14 ? 'bg-success-50 border-success-200' : 'bg-accent-50 border-accent-200'}`}>
                   <span className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-2">Nota Final</span>
                   <div className="flex items-baseline gap-1">
                     <span className={`text-6xl font-black ${finalScore >= 14 ? 'text-success-600' : 'text-accent-600'}`}>{finalScore}</span>
                     <span className="text-2xl font-bold text-slate-400">/20</span>
                   </div>
                </div>
                
                <div className="flex-1 flex flex-col gap-4">
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                       <span className="text-indigo-500 bg-white p-2 rounded-lg shadow-sm">✨</span>
                       <span className="font-bold text-slate-700">XP Ganada</span>
                     </div>
                     <span className="font-black text-indigo-700 text-xl">+{xpGained}</span>
                  </div>
                  
                  <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                       <span className="text-rose-500 bg-white p-2 rounded-lg shadow-sm"><Heart size={20} fill="currentColor"/></span>
                       <span className="font-bold text-slate-700">Corazones Restantes</span>
                     </div>
                     <span className="font-black text-rose-700 text-xl">{feedback?.updatedUser?.hearts || user?.hearts}</span>
                  </div>
                </div>
              </div>
              
              {/* History Table */}
              <h3 className="text-xl font-black text-slate-800 mb-4 tracking-tight border-b-2 border-slate-100 pb-2">Historial de Misiones</h3>
              <div className="space-y-3 mb-10 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                 {responsesHistory.map((item, idx) => (
                   <div key={idx} className={`p-4 rounded-xl border flex gap-4 ${item.isCorrect ? 'bg-success-50/50 border-success-100' : 'bg-accent-50/50 border-accent-100'}`}>
                     <div className={`mt-1 shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-black text-white shadow-sm ${item.isCorrect ? 'bg-success-500' : 'bg-accent-500'}`}>
                        {item.isCorrect ? '✓' : '✗'}
                     </div>
                     <div>
                       <p className="text-xs font-bold text-slate-400 mb-1">Misión {idx + 1}</p>
                       <p className="text-sm font-semibold text-slate-700 leading-snug">{item.text}</p>
                     </div>
                   </div>
                 ))}
              </div>
              
              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 mt-4 border-t-2 border-slate-100 justify-center">
                <button 
                   onClick={() => onEnd(feedback?.updatedUser || user)}
                   className="w-full sm:w-2/3 py-4 px-6 text-white text-lg font-black rounded-2xl shadow-lg bg-brand-600 hover:bg-brand-700 transition-transform active:scale-95 flex items-center justify-center gap-2"
                >
                   Regresar al Mapa de Módulos <span>→</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
