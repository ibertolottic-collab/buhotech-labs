import React, { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Lesson from './components/Lesson';
import AdminDashboard from './components/AdminDashboard';
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard'); // 'login', 'dashboard', 'lesson'
  const [selectedPhase, setSelectedPhase] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    const uname = userData.username.toLowerCase().trim();
    if (uname === 'admin' || uname === 'admin-buhotech') {
      setCurrentView('admin');
    } else {
      setCurrentView('dashboard');
    }
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
    <div className="min-h-[100dvh] bg-slate-50 flex justify-center items-center text-slate-900 font-sans md:p-4">
      <div className="w-full max-w-md bg-white md:rounded-[2rem] shadow-2xl overflow-hidden md:border border-slate-200 flex flex-col relative h-[100dvh] md:h-[95vh] md:max-h-[900px]">
        {currentView === 'login' && <Login onLogin={handleLogin} />}
        {currentView === 'dashboard' && <Dashboard user={user} onStart={handleStartLesson} onLogout={() => setUser(null)} />}
        {currentView === 'admin' && <AdminDashboard onLogout={() => { setUser(null); setCurrentView('login'); }} />}
        {currentView === 'lesson' && <Lesson user={user} phase={selectedPhase} onEnd={handleEndLesson} />}
      </div>
    </div>
  );
}

export default App;
