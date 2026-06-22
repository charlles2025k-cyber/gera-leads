import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import ResetPassword from './components/ResetPassword';
import Dashboard from './components/Dashboard';
import AnimatedBackground from './components/AnimatedBackground';
import LandingPage from './components/LandingPage';
import Alert from './components/Alert';
import { supabase } from './lib/supabase';

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login'); // 'login' | 'register'
  const [initLoading, setInitLoading] = useState(true);
  const [path, setPath] = useState(window.location.pathname);
  const [alertState, setAlertState] = useState({
    isOpen: false,
    message: '',
    type: 'info'
  });

  const showAlert = (message, type = 'info') => {
    setAlertState({ isOpen: true, message, type });
  };

  // Sync route path state on browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Check active session on mount and subscribe to changes
  useEffect(() => {
    let authListener = null;

    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session) {
          setUser({
            name: session.user.user_metadata?.name || session.user.email,
            email: session.user.email
          });
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Falha ao carregar sessão ativa', err);
      } finally {
        setInitLoading(false);
      }
    };

    checkSession();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser({
          name: session.user.user_metadata?.name || session.user.email,
          email: session.user.email
        });
      } else {
        setUser(null);
        setView('login');
      }
    });

    authListener = subscription;

    return () => {
      if (authListener) {
        authListener.unsubscribe();
      }
    };
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Erro ao deslogar', err);
    }
    setUser(null);
    setView('login');
    window.history.pushState({}, '', '/app');
    setPath('/app');
  };

  const renderContent = () => {
    // Route: Reset Password page (supporting both old /redefinir-senha and new /app/redefinir-senha paths)
    if (path === '/redefinir-senha' || path === '/app/redefinir-senha') {
      return (
        <AnimatedBackground>
          <ResetPassword 
            showAlert={showAlert}
            onSuccess={async () => {
              // Sign out of the temporary recovery session so user isn't logged in with it
              await supabase.auth.signOut();
              setUser(null);
              setView('login');
              window.history.pushState({}, '', '/app');
              setPath('/app');
            }}
            onCancel={() => {
              setView('login');
              window.history.pushState({}, '', '/app');
              setPath('/app');
            }}
          />
        </AnimatedBackground>
      );
    }

    // Route: Landing page at root "/"
    if (path === '/') {
      return (
        <LandingPage 
          showAlert={showAlert}
          onNavigateApp={() => {
            window.history.pushState({}, '', '/app');
            setPath('/app');
          }}
        />
      );
    }

    // Route: App paths under "/app"
    if (path.startsWith('/app')) {
      if (user) {
        return (
          <Dashboard 
            user={user} 
            onLogout={handleLogout} 
            showAlert={showAlert}
          />
        );
      }

      return (
        <AnimatedBackground>
          {view === 'login' ? (
            <Login 
              onLoginSuccess={handleLoginSuccess}
              onNavigateToRegister={() => setView('register')}
              showAlert={showAlert}
            />
          ) : (
            <Register 
              onLoginSuccess={handleLoginSuccess}
              onNavigateToLogin={() => setView('login')}
              showAlert={showAlert}
            />
          )}
        </AnimatedBackground>
      );
    }

    // Fallback: default to landing page
    return (
      <LandingPage 
        showAlert={showAlert}
        onNavigateApp={() => {
          window.history.pushState({}, '', '/app');
          setPath('/app');
        }}
      />
    );
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

  return (
    <>
      {renderContent()}
      {alertState.isOpen && (
        <Alert 
          message={alertState.message} 
          type={alertState.type} 
          onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))} 
        />
      )}
    </>
  );
}
