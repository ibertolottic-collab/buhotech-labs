import React, { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Lesson from './components/Lesson';
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard'); // 'login', 'dashboard', 'lesson'
  const [selectedPhase, setSelectedPhase] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentView('dashboard');
  };

  const handleStartLesson = (phaseName) => {
    setSelectedPhase(phaseName);
    setCurrentView('lesson');
  };

  const handleEndLesson = (updatedUser) => {
    setUser(updatedUser);
    setCurrentView('dashboard');
  };

  if (!user && currentView !== 'login') {
    setCurrentView('login');
  }

  return (
    <div className="min-h-dynamic bg-slate-50 flex justify-center text-slate-900 font-sans md:p-4">
      <div className="w-full max-w-md bg-white md:rounded-3xl shadow-xl md:overflow-hidden md:border border-slate-100 flex flex-col relative h-dynamic md:h-auto md:max-h-[98vh]">
        {currentView === 'login' && <Login onLogin={handleLogin} />}
        {currentView === 'dashboard' && <Dashboard user={user} onStart={handleStartLesson} onLogout={() => setUser(null)} />}
        {currentView === 'lesson' && <Lesson user={user} phase={selectedPhase} onEnd={handleEndLesson} />}
      </div>
    </div>
  );
}

export default App;
