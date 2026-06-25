import React, { useState } from 'react';
import { Download, BrainCircuit } from 'lucide-react';
import axios from 'axios';

export default function AdminDashboard({ onLogout }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await axios({
        url: '/api/admin/export',
        method: 'GET',
        responseType: 'blob', // Important: tell axios we expect a binary blob
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'buhotech_research_data.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert("Error descargando los datos. Asegúrate de que los alumnos hayan jugado misiones.");
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col pt-6 overflow-hidden bg-slate-50">
      <div className="px-6 flex justify-between items-center mb-6 pb-4 border-b border-slate-200">
        <div>
           <h2 className="text-2xl font-black text-slate-800 tracking-tight">Panel de Control</h2>
           <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mt-1">Vista de Investigador</p>
        </div>
        <button onClick={onLogout} className="text-brand-600 font-bold bg-white px-5 py-2.5 rounded-xl shadow-sm border border-brand-100 active:scale-95 transition-transform">Salir</button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-20 override-scroll flex flex-col items-center">
        
        <div className="w-full max-w-sm mb-10 mt-8">
           <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 text-center relative overflow-hidden group hover:border-brand-200 transition-colors">
              <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-brand-400 to-indigo-500"></div>
              
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <BrainCircuit size={40} className="text-indigo-500" />
              </div>

              <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">Data Mart de Alumnos</h3>
              <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">
                Descarga de forma segura el consolidado completo con respuestas, tiempos de lectura en milisegundos y etiquetas cognitivas para análisis estadístico.
              </p>
              
              <button 
                 onClick={handleDownload}
                 disabled={downloading}
                 className="w-full py-4 bg-success-600 hover:bg-success-700 active:scale-95 transition-all outline-hidden rounded-2xl text-white font-black text-lg flex justify-center items-center shadow-lg shadow-success-600/30 gap-3 disabled:opacity-70 disabled:active:scale-100"
              >
                 <Download size={24} /> 
                 {downloading ? 'Generando CSV...' : 'Descargar Dataset CSV'}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
