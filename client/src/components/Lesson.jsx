import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Heart, X } from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

// Simple Audio Synthesizer for game sounds
const playSound = (type) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'error') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } else if (type === 'select') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    }
  } catch(e) { /* audio context might be blocked or unsupported */ }
};

export default function Lesson({ user, phase, onEnd }) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null); // { type, text }
  const [selectedOption, setSelectedOption] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  
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
    const isCorrect = selectedOption === currentQ.correct_answer;

    try {
      const res = await axios.post(`${API_URL}/responses`, {
        user_id: user.id,
        question_id: currentQ.id,
        is_correct: isCorrect,
        response_time_ms: responseTimeMs
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

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(curr => curr + 1);
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
      alert('¡Módulo completado!');
      onEnd(updatedUser);
    }
  };

  if (loading) return <div className="flex-1 flex justify-center items-center"><p className="font-bold animate-pulse text-brand-500 text-xl tracking-widest text-center">CARGANDO<br/>NUEVA MISIÓN...</p></div>;
  if (!questions.length) return <div className="p-4"><p>No hay preguntas disponibles.</p><button onClick={() => onEnd(user)} className="btn-secondary">Volver</button></div>;

  const q = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative override-scroll">
      {/* Header Progress */}
      <div className="px-6 py-4 flex items-center justify-between z-10 bg-white shadow-sm border-b border-slate-100">
        <button onClick={() => onEnd(user)} className="text-slate-400 hover:text-slate-600 transition-colors">
          <X size={28} />
        </button>
        <div className="flex-1 mx-4 h-5 bg-slate-200 rounded-full overflow-hidden relative">
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
      <div className="flex-1 px-6 pt-6 pb-40 overflow-y-auto flex flex-col items-center">
        <h3 className="text-brand-600 font-black text-sm tracking-widest uppercase mb-4 opacity-80">{q.phase}</h3>
        
        {/* Scenario Image */}
        {q.image_filename && (
          <div 
             className="w-full max-w-sm aspect-video bg-indigo-50 rounded-2xl mb-8 border-4 border-slate-100 flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:scale-[1.02] hover:shadow-xl transition-all duration-300 relative group"
            onClick={() => setIsExpanded(true)}
          >
            <img 
               src={`http://localhost:3001/images/${encodeURIComponent(q.image_filename)}`} 
              alt={q.phase}
              className="object-cover w-full h-full transform transition duration-500 group-hover:scale-105"
              onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<span class="text-slate-400 font-bold">Sin Imagen</span>'; }}
            />
            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
              <span className="text-white text-xs font-bold block text-center">🔍 Ampliar Pista</span>
            </div>
          </div>
        )}

        <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-10 leading-snug tracking-tight text-center">
          {q.text}
        </h2>

        <div className="w-full space-y-4">
          {q.options.map(opt => {
            const isSelected = selectedOption === opt.id;
            let btnClass = "w-full text-left p-6 rounded-3xl border-4 font-bold transition-all relative overflow-hidden ";
            
            if (!feedback) {
              btnClass += isSelected 
                ? "border-brand-400 bg-brand-50 text-brand-800 scale-[1.02] shadow-md shadow-brand-100/50" 
                : "border-slate-200 bg-white hover:border-slate-300 text-slate-600 hover:bg-slate-50 shadow-sm active:scale-95";
            } else {
              const isCorrectOption = opt.id === q.correct_answer;
              
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
      {!feedback && (
        <div className={`absolute bottom-0 left-0 right-0 p-4 bg-white border-t-2 border-slate-100 shadow-[0_-10px_40px_-5px_rgba(0,0,0,0.1)] transition-transform duration-300 z-20 ${selectedOption ? 'translate-y-0' : 'translate-y-full opacity-0'}`}>
           <button 
             onClick={handleCheck}
             disabled={isChecking}
             className="w-full py-4 text-xl font-black rounded-2xl shadow-lg transition-all active:scale-95 bg-brand-500 hover:bg-brand-600 text-white flex justify-center items-center"
           >
             {isChecking ? 'Comprobando...' : 'COMPROBAR'}
           </button>
        </div>
      )}

      {/* Image Modal Lightbox */}
      {isExpanded && q.image_filename && (
        <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <button 
            className="absolute top-6 right-6 text-white/50 hover:text-white bg-white/10 rounded-full p-3 transition-colors cursor-pointer hover:scale-110 active:scale-90"
            onClick={() => setIsExpanded(false)}
          >
            <X size={32} />
          </button>
          <img 
            src={`http://localhost:3001/images/${encodeURIComponent(q.image_filename)}`} 
            alt={q.phase}
            className="w-full h-auto max-w-5xl max-h-[90vh] object-contain rounded-xl shadow-2xl ring-1 ring-white/20"
          />
        </div>
      )}

      {/* Feedback Drawer */}
      {feedback && (
        <div className={`absolute bottom-0 left-0 right-0 px-6 py-6 pb-8 rounded-t-3xl shadow-[0_-20px_50px_-5px_rgba(0,0,0,0.2)] animate-slide-up z-30 transition-colors duration-500 ${feedback.isCorrect ? 'bg-success-100 ring-1 ring-success-200' : 'bg-accent-100 ring-1 ring-accent-200'}`}>
          <div className="flex items-start mb-6">
            <div className="mt-1 mr-4 shrink-0 bg-white p-2 rounded-full shadow-sm">
              <span className="text-3xl" role="img" aria-label="mascot">🦉</span>
            </div>
            <div>
              <h3 className={`font-black text-2xl tracking-tight mb-2 ${feedback.isCorrect ? 'text-success-700' : 'text-accent-700'}`}>
                {feedback.isCorrect ? '¡Excelente Intuición!' : 'Misión de Rescate'}
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
    </div>
  );
}
