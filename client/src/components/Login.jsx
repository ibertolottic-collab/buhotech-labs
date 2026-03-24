import React, { useState } from 'react';
import axios from 'axios';
import { RocketIcon } from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

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
    <div className="flex-1 flex flex-col justify-center items-center p-8 bg-gradient-to-b from-brand-50 to-white">
      <div className="w-20 h-20 bg-brand-500 rounded-3xl flex items-center justify-center text-white shadow-lg mb-8 rotate-12">
        <RocketIcon size={40} className="-rotate-12" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-800 mb-2 font-sans tracking-tight">Antigravity</h1>
      <p className="text-slate-500 mb-8 text-center">Aprende Metodología de la Investigación</p>
      
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
