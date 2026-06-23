import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Login({ onLoginSuccess, onNavigateToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResetInput, setShowResetInput] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');

    if (!resetEmail) {
      setResetError('Por favor, digite seu e-mail.');
      return;
    }

    setResetLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: 'https://gera-leads.vercel.app/redefinir-senha',
      });

      if (error) {
        setResetError(`Erro ao enviar e-mail: ${error.message}`);
        setResetLoading(false);
        return;
      }

      setResetSuccess('Enviamos um link para seu email. Verifique também o spam.');
      setResetEmail('');
    } catch (err) {
      setResetError('Ocorreu um erro ao enviar o link. Tente novamente.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('Credenciais inválidas. Verifique seu e-mail e senha.');
        } else {
          setError(`Erro ao fazer login: ${error.message}`);
        }
        setLoading(false);
        return;
      }

      if (data.user) {
        onLoginSuccess({
          name: data.user.user_metadata?.name || data.user.email,
          email: data.user.email
        });
      }
    } catch (err) {
      setError('Ocorreu um erro ao processar o login. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 shadow-2xl animate-fade-in login-card-glow">
      <div className="flex flex-col items-center mb-8">
        <img 
          src="/logo.jpg" 
          alt="Gera Leads" 
          className="w-16 h-16 rounded-xl shadow-lg shadow-indigo-500/10 border border-slate-800 mb-4" 
        />
        <h2 className="text-3xl font-bold font-display text-white text-center">
          Bem-vindo de volta
        </h2>
        <p className="text-slate-400 text-sm mt-2 text-center">
          Faça login para gerenciar e exportar seus leads do Google Maps
        </p>
      </div>

      {error && (
        <div className="p-3 mb-6 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs text-center font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-1.5" htmlFor="email">
            E-mail
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
              <Mail className="w-5 h-5" />
            </span>
            <input
              type="email"
              id="email"
              className="w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-slate-800 focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 rounded-xl text-white placeholder-slate-500 outline-none transition-all text-sm"
              placeholder="seu-email@dominio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-slate-300 text-sm font-medium" htmlFor="password">
              Senha
            </label>
          </div>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
              <Lock className="w-5 h-5" />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              className="w-full pl-10 pr-12 py-3 bg-slate-950/50 border border-slate-800 focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 rounded-xl text-white placeholder-slate-500 outline-none transition-all text-sm"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors mt-1 focus:outline-none"
            onClick={() => setShowResetInput(!showResetInput)}
            disabled={loading}
          >
            Esqueci minha senha
          </button>
        </div>

        {showResetInput && (
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-3 mt-2">
            <p className="text-xs text-slate-400">
              Digite seu e-mail para receber o link de recuperação:
            </p>
            <input
              type="email"
              placeholder="seu-email@dominio.com"
              className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800 focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 rounded-lg text-white placeholder-slate-500 outline-none transition-all text-xs"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              disabled={resetLoading}
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                onClick={() => {
                  setShowResetInput(false);
                  setResetEmail('');
                  setResetError('');
                  setResetSuccess('');
                }}
                disabled={resetLoading}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
                onClick={handleResetPassword}
                disabled={resetLoading}
              >
                {resetLoading ? 'Enviando...' : 'Enviar Link'}
              </button>
            </div>
            {resetError && (
              <p className="text-xs text-red-400 text-center font-medium mt-1">
                {resetError}
              </p>
            )}
            {resetSuccess && (
              <p className="text-xs text-green-400 text-center font-medium mt-1">
                {resetSuccess}
              </p>
            )}
          </div>
        )}

        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          disabled={loading}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Entrar
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
