import { useState } from 'react';
import { Lock, Eye, EyeOff, Key, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ResetPassword({ onSuccess, onCancel }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState(() => {
    // Check if there is an error in the URL hash (e.g. from an expired or invalid recovery link)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const errorCode = hashParams.get('error');
    const errorDesc = hashParams.get('error_description');

    if (errorCode || errorDesc) {
      const decodedDesc = errorDesc ? decodeURIComponent(errorDesc.replace(/\+/g, ' ')) : '';
      
      if (
        decodedDesc.toLowerCase().includes('expired') || 
        decodedDesc.toLowerCase().includes('invalid') ||
        errorCode === 'access_denied'
      ) {
        return 'O link de recuperação de senha expirou ou é inválido. Por favor, solicite um novo link.';
      }
      return decodedDesc || 'Erro ao processar o link de recuperação.';
    }
    return '';
  });
  
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // If an error is already set (like expired link), prevent submitting
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    if (hashParams.get('error')) {
      setError('Não é possível redefinir a senha com um link expirado ou inválido.');
      return;
    }

    if (!password || !confirmPassword) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    if (password.length < 6) {
      setError('A nova senha deve conter no mínimo 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);

    try {
      // Supabase's updateUser updates the currently authenticated session user
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        if (updateError.message.includes('Auth session missing') || updateError.message.includes('JWT')) {
          setError('Sessão de recuperação inválida ou expirada. Por favor, tente redefinir sua senha novamente.');
        } else {
          setError(`Erro ao atualizar senha: ${updateError.message}`);
        }
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);

      // Trigger onSuccess redirection callback after 3 seconds
      setTimeout(() => {
        onSuccess();
      }, 3000);

    } catch (err) {
      console.error('Erro de redefinição de senha:', err);
      setError('Ocorreu um erro ao atualizar a senha. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 shadow-2xl animate-fade-in login-card-glow">
      {success ? (
        <div className="flex flex-col items-center justify-center py-8 text-center animate-scale-up">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 mb-4 animate-bounce">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-bold font-display text-white mb-2">Senha Atualizada!</h2>
          <p className="text-slate-400 text-sm">
            Sua senha foi redefinida com sucesso. Redirecionando para o login...
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center mb-8">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20 mb-4 animate-pulse-soft">
              <Key className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold font-display text-white text-center">
              Redefinir Senha
            </h2>
            <p className="text-slate-400 text-sm mt-2 text-center">
              Digite e confirme sua nova senha para recuperar o acesso à sua conta.
            </p>
          </div>

          {error && (
            <div className="p-3 mb-6 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1.5" htmlFor="password">
                Nova Senha
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="w-full pl-10 pr-12 py-3 bg-slate-950/50 border border-slate-800 focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 rounded-xl text-white placeholder-slate-500 outline-none transition-all text-sm"
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
                Confirmar Nova Senha
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  className="w-full pl-10 pr-12 py-3 bg-slate-950/50 border border-slate-800 focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 rounded-xl text-white placeholder-slate-500 outline-none transition-all text-sm"
                  placeholder="Repita sua nova senha"
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
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Redefinir minha senha
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors focus:outline-none font-medium"
              onClick={onCancel}
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
