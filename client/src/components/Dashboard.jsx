import React, { useState } from 'react';
import { Heart, Flame, ShieldCheck, PlayCircle, LogOut, Lock, Download } from 'lucide-react';
import axios from 'axios';
import jsPDF from 'jspdf';

export default function Dashboard({ user, onStart, onLogout }) {
  const [generatingReport, setGeneratingReport] = useState(false);
  const modules = [
    { id: 1, title: 'Fase 1: Los Archivos de la Humanidad' },
    { id: 2, title: 'Fase 2: El Mapa del Detective' },
    { id: 3, title: 'Fase 3: Las Lentes del Investigador' },
    { id: 4, title: 'Fase 4: La Sospecha y el Campo' },
    { id: 5, title: 'Fase 5: El Jefe Final' }
  ];

  const handleGenerateFinalReport = async () => {
    try {
      setGeneratingReport(true);
      const API_URL = '/api';
      const res = await axios.get(`${API_URL}/users/${user.id}/report`);
      const history = res.data;
      
      const numQuestions = history.length;
      if (numQuestions === 0) {
        alert("Aún no tienes historial de misiones.");
        setGeneratingReport(false);
        return;
      }
      
      const correctCount = history.filter(r => r.isCorrect).length;
      const score = Math.round(10 + (correctCount / numQuestions) * 10);

      const doc = new jsPDF();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor("#4f46e5");
      doc.text("Búhotech Labs - Reporte General Final", 20, 20);
      
      doc.setFontSize(14);
      doc.setTextColor("#334155");
      doc.text(`Detective: ${user.username}`, 20, 35);
      
      // Vigesimal Score
      doc.setFontSize(18);
      doc.setTextColor(score >= 14 ? "#16a34a" : "#dc2626");
      doc.text(`Nota Final Global: ${score} / 20`, 20, 48);
      
      doc.setFontSize(12);
      doc.setTextColor("#334155");
      doc.text(`Total de Misiones: ${numQuestions}`, 20, 60);
      doc.text(`Aciertos: ${correctCount} | Errores: ${numQuestions - correctCount}`, 20, 68);
      
      doc.setFont("helvetica", "bold");
      doc.text("Detalle de Misiones por Fase:", 20, 85);
      
      let y = 95;
      doc.setFont("helvetica", "normal");
      
      let currentPhase = "";
      
      history.forEach((item, index) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        
        if (item.phase !== currentPhase) {
          y += 5;
          doc.setFont("helvetica", "bold");
          doc.setTextColor("#4f46e5");
          doc.text(item.phase, 20, y);
          y += 8;
          currentPhase = item.phase;
          doc.setFont("helvetica", "normal");
        }
        
        doc.setTextColor(item.isCorrect ? "#16a34a" : "#dc2626");
        const icon = item.isCorrect ? "[✓ Correcto]" : "[✗ Incorrecto]";
        const lines = doc.splitTextToSize(`${icon} ${item.text}`, 170);
        doc.text(lines, 20, y);
        y += lines.length * 6 + 4;
      });
      
      doc.save(`Informe_General_Birdbrain_${user.username}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Error al generar el informe.");
    } finally {
      setGeneratingReport(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col pt-6 overflow-hidden">
      <div className="px-6 flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
        <h2 className="text-xl font-extrabold tracking-tight">¡Hola, {user.username}!</h2>
        <button onClick={onLogout} className="p-2 text-slate-400 hover:text-slate-700">
          <LogOut size={20} />
        </button>
      </div>

      <div className="flex justify-around items-center px-4 mb-6">
        <div className="flex flex-col items-center">
          <div className="flex items-center text-accent-500 mb-1">
            <Heart size={28} className="fill-accent-500" />
            <span className="ml-1 text-2xl font-black">{user.hearts}</span>
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Vidas</span>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="flex items-center text-orange-500 mb-1">
            <Flame size={28} className="fill-orange-500" />
            <span className="ml-1 text-2xl font-black">{user.streak_days}</span>
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Racha</span>
        </div>

        <div className="flex flex-col items-center">
          <div className="flex items-center text-brand-500 mb-1">
            <ShieldCheck size={28} className="fill-brand-500" />
            <span className="ml-1 text-2xl font-black">{user.xp}</span>
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">EXP</span>
        </div>
      </div>

      <div className="flex-1 px-6 pb-12 overflow-y-auto override-scroll flex flex-col items-center relative">
        <h3 className="text-brand-600 font-bold mb-6 tracking-widest uppercase text-sm z-10 bg-white px-4 rounded-full py-1 shadow-sm border border-brand-100">Ruta de Detectives</h3>
        
        <div className="w-full flex flex-col space-y-8 relative">
          {/* Progress Connecting Line */}
          <div className="absolute left-1/2 top-4 bottom-10 w-2 bg-slate-200 -translate-x-1/2 rounded-full z-0"></div>
          <div 
            className="absolute left-1/2 top-4 w-2 bg-brand-400 -translate-x-1/2 rounded-full z-0 transition-all duration-1000"
            style={{ height: `${Math.min(100, (user.unlocked_module / modules.length) * 100)}%` }}
          ></div>

          {modules.map((phase) => {
            const isLocked = phase.id > user.unlocked_module;
            const isCurrent = phase.id === user.unlocked_module;
            const isCompleted = phase.id < user.unlocked_module;

            let btnStyle = "";
            let iconColor = "";

            if (isLocked) {
              btnStyle = "bg-slate-100 border-slate-200 text-slate-400 opacity-80 cursor-not-allowed grayscale";
              iconColor = "text-slate-400";
            } else if (isCurrent) {
              btnStyle = "bg-brand-50 border-brand-400 text-brand-900 border-b-4 shadow-md transform scale-105 z-10 hover:bg-brand-100 animate-pulse-slow";
              iconColor = "text-brand-500 fill-brand-100";
            } else if (isCompleted) {
              btnStyle = "bg-success-50 border-success-300 text-success-800 border-b-4 hover:bg-success-100 z-10";
              iconColor = "text-success-500 fill-success-100";
            }

            return (
              <button 
                key={phase.id} 
                onClick={() => (!isLocked && user.hearts > 0) ? onStart(phase.title) : null}
                className={`relative w-full text-left p-5 rounded-2xl border-2 font-bold transition-all flex justify-between items-center ${btnStyle}`}
              >
                <div>
                  <div className={`text-xs font-black mb-1 uppercase tracking-widest ${isLocked ? 'text-slate-400' : isCurrent ? 'text-brand-600' : 'text-success-600'}`}>
                    Módulo {phase.id}
                  </div>
                  <div className="text-[1.05rem] leading-tight font-black">{phase.title.split(': ')[1] || phase.title}</div>
                </div>
                {isLocked ? (
                  <div className="bg-slate-200 p-3 rounded-full"><Lock size={24} className={iconColor} /></div>
                ) : (
                  <div className={`p-1 rounded-full bg-white shadow-sm ${isCurrent ? 'ring-4 ring-brand-100' : ''}`}>
                    <PlayCircle size={36} className={iconColor} />
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {user.unlocked_module > 5 && (
          <div className="w-full mt-10 pt-8 border-t-2 border-slate-200 border-dashed flex flex-col items-center animate-in slide-in-from-bottom-5 duration-700">
             <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mb-4 shadow-sm">
                <span className="text-3xl">🎓</span>
             </div>
             <h3 className="text-2xl font-black text-slate-800 text-center mb-2">¡Programa Completado!</h3>
             <p className="text-slate-500 text-center font-medium mb-6 px-4">
               Has finalizado todas las fases exitosamente. Ahora puedes descargar tu informe oficial con todos tus resultados y entregarlo en la Tarea N°3.
             </p>
             <button 
                onClick={handleGenerateFinalReport}
                disabled={generatingReport}
                className="w-full py-5 px-6 text-white text-xl font-black rounded-2xl shadow-xl bg-success-600 hover:bg-success-700 active:scale-95 transition-all text-center flex items-center justify-center gap-3 disabled:opacity-70 disabled:active:scale-100"
             >
                <Download size={24} />
                {generatingReport ? 'GENERANDO PDF...' : 'DESCARGAR INFORME GENERAL'}
             </button>
          </div>
        )}

        {user.hearts <= 0 && (
          <p className="text-accent-500 mt-8 font-black text-center bg-accent-50 p-4 rounded-xl border-2 border-accent-200 shadow-sm z-20 w-full animate-bounce">
            💔 ¡Sin vidas! Repasa la teoría para recuperarte.
          </p>
        )}
      </div>
    </div>
  );
}
