import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login'); // 'login' | 'register'
  const [initLoading, setInitLoading] = useState(true);

  // Check active session on mount
  useEffect(() => {
    try {
      const activeSession = localStorage.getItem('currentUser');
      if (activeSession) {
        setUser(JSON.parse(activeSession));
      }
    } catch (err) {
      console.error('Falha ao carregar sessão ativa', err);
    } finally {
      setInitLoading(false);
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
    setView('login');
  };

  if (initLoading) {
    return (
      <div className="w-screen h-screen flex justify-center items-center bg-[#090d16]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          <span className="text-slate-400 text-xs font-semibold tracking-wider uppercase">Carregando...</span>
        </div>
      </div>
    );
  }

  // If user is authenticated, render the Dashboard
  if (user) {
    return (
      <Dashboard 
        user={user} 
        onLogout={handleLogout} 
      />
    );
  }

  // Otherwise, render authentication pages (Login or Register)
  return (
    <div className="w-screen min-h-screen flex items-center justify-center p-4">
      {view === 'login' ? (
        <Login 
          onLoginSuccess={handleLoginSuccess}
          onNavigateToRegister={() => setView('register')}
        />
      ) : (
        <Register 
          onNavigateToLogin={() => setView('login')}
        />
      )}
    </div>
  );
}
