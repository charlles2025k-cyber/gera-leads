import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, UserPlus, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function Register({ onNavigateToLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor, insira um e-mail válido.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);

    // Mock network latency for premium feel
    setTimeout(() => {
      try {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Check if email already registered
        const userExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
        if (userExists) {
          setError('Este e-mail já está sendo utilizado.');
          setLoading(false);
          return;
        }

        // Add user
        const newUser = { name, email, password };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        setSuccess(true);
        setLoading(false);

        // Auto redirect to login after 1.5 seconds
        setTimeout(() => {
          onNavigateToLogin();
        }, 1500);
      } catch (err) {
        setError('Ocorreu um erro ao cadastrar a conta. Tente novamente.');
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="w-full max-w-md p-8 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 shadow-2xl animate-fade-in">
      {success ? (
        <div className="flex flex-col items-center justify-center py-8 text-center animate-scale-up">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 mb-4 animate-bounce">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-bold font-display text-white mb-2">Conta Criada!</h2>
          <p className="text-slate-400 text-sm">
            Seu cadastro foi realizado com sucesso. Redirecionando para a tela de login...
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center mb-8">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 mb-4 animate-pulse-soft">
              <UserPlus className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold font-display text-white text-center">
              Criar Conta
            </h2>
            <p className="text-slate-400 text-sm mt-2 text-center">
              Comece a encontrar e catalogar novos leads de negócios
            </p>
          </div>

          {error && (
            <div className="p-3 mb-6 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1.5" htmlFor="name">
                Nome Completo
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <User className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  id="name"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-slate-800 focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/50 rounded-xl text-white placeholder-slate-500 outline-none transition-all text-sm"
                  placeholder="Nome Sobrenome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

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
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-slate-800 focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/50 rounded-xl text-white placeholder-slate-500 outline-none transition-all text-sm"
                  placeholder="seu-email@dominio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1.5" htmlFor="password">
                Senha
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="w-full pl-10 pr-12 py-3 bg-slate-950/50 border border-slate-800 focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/50 rounded-xl text-white placeholder-slate-500 outline-none transition-all text-sm"
                  placeholder="Mínimo 6 caracteres"
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

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1.5" htmlFor="confirmPassword">
                Confirmar Senha
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  className="w-full pl-10 pr-12 py-3 bg-slate-950/50 border border-slate-800 focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/50 rounded-xl text-white placeholder-slate-500 outline-none transition-all text-sm"
                  placeholder="Repita sua senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300 transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Criar minha conta
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors focus:outline-none font-medium"
              onClick={onNavigateToLogin}
              disabled={loading}
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para o Login
            </button>
          </div>
        </>
      )}
    </div>
  );
}
