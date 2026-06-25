import React, { useState } from 'react';
import axios from 'axios';

const API_URL = '/api';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/users/login`, { username });
      onLogin(res.data);
    } catch (err) {
      console.error(err);
      alert('Error during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center p-8 bg-linear-to-b from-brand-50 to-white">
      <p className="text-red-700 font-black uppercase tracking-widest text-xl sm:text-2xl mb-8 drop-shadow-sm">USMP - Virtual</p>
      
      <img src="/images/logo_nuevo.png" alt="Búhotech Logo" className="w-28 h-28 object-contain rounded-3xl mb-6 shadow-xl" />
      
      <h1 className="text-3xl font-extrabold text-slate-800 mb-2 font-sans tracking-tight text-center leading-tight">
        Búhotech Labs <br/>
        <span className="text-xl text-brand-600 font-bold">- modelo Birdbrain -</span>
      </h1>
      <p className="text-slate-500 mb-8 text-center font-bold text-sm tracking-wide">(aprendizaje potenciado con IA)</p>
      
      <form onSubmit={handleSubmit} className="w-full">
        <input 
          type="text" 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Tu nombre de detective..." 
          className="w-full p-4 rounded-2xl bg-slate-100 border-2 border-transparent focus:border-brand-500 focus:bg-white outline-none transition-all mb-4 text-center font-bold text-lg text-slate-700"
        />
        <button 
          disabled={loading || !username}
          className="w-full btn-primary py-4 text-xl"
        >
          {loading ? 'Entrando...' : 'Comenzar'}
        </button>
      </form>
    </div>
  );
}
