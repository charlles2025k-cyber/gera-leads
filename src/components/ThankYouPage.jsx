import React from 'react';
import { CheckCircle2, ArrowRight, MessageSquare, Key, BookOpen, User, Sparkles } from 'lucide-react';

export default function ThankYouPage({ onNavigateApp }) {
  return (
    <div className="relative min-h-screen bg-[#070b13] text-slate-100 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      
      {/* Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[45%] h-[45%] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-5%] left-[20%] w-[50%] h-[50%] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#070b13]/80 backdrop-blur-xl border-b border-slate-900/60 transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.jpg" 
              alt="Gera Leads" 
              className="w-10 h-10 rounded-xl shadow-lg border border-slate-800" 
            />
            <span className="text-lg font-bold text-white tracking-tight font-display">
              Gera Leads
            </span>
          </div>

          <button
            onClick={onNavigateApp}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-850 text-slate-200 hover:text-white border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-semibold tracking-wide transition-all active:scale-[0.98] cursor-pointer shadow-md"
          >
            Acessar Plataforma
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-12 px-4 sm:px-6">
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: -1,
            backgroundImage: 'linear-gradient(to right, #1e1b4b22 1px, transparent 1px), linear-gradient(to bottom, #1e1b4b22 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            maskImage: 'radial-gradient(ellipse at center, transparent 20%, black 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, transparent 20%, black 80%)',
          }}
        />

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          {/* Green animated checkmark */}
          <div className="flex justify-center mb-2">
            <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.15)] animate-pulse-soft">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 stroke-[2.5]" />
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-display text-white tracking-tight leading-[1.1] max-w-3xl mx-auto">
            Compra Confirmada! <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-indigo-400 bg-clip-text text-transparent">🎉</span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            Bem-vindo ao Gera Leads. Siga os passos abaixo para começar.
          </p>
        </div>
      </section>

      {/* Steps Grid Section */}
      <section className="py-12 max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          
          {/* Step 1 */}
          <div className="rounded-2xl border border-slate-850 bg-slate-900/40 p-6 flex flex-col justify-between shadow-xl backdrop-blur-xl hover:border-slate-800 transition-all">
            <div className="space-y-4">
              <span className="inline-flex px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full text-[10px] font-bold tracking-wider uppercase">
                PASSO 1
              </span>
              <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-400" />
                Acesse sua conta
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Clique no botão abaixo para ir para a plataforma do Gera Leads.
              </p>
            </div>
            
            <button
              onClick={onNavigateApp}
              className="mt-6 w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md"
            >
              Acessar minha conta
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Step 2 (Highlighted with Border & Glow + Warning) */}
          <div className="rounded-2xl border border-indigo-500 bg-slate-900/60 p-6 flex flex-col justify-between shadow-[0_0_30px_rgba(99,102,241,0.15)] backdrop-blur-xl hover:border-indigo-400 transition-all">
            <div className="space-y-4">
              <span className="inline-flex px-2.5 py-0.5 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 rounded-full text-[10px] font-bold tracking-wider uppercase">
                PASSO 2 — Mais Importante
              </span>
              <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                Defina sua senha
              </h3>
              <p className="text-xs text-slate-350 leading-relaxed">
                Clique em <strong>'Esqueci minha senha'</strong> na tela de login e envie o link para o mesmo email usado na compra.
              </p>

              {/* Warning box in yellow/orange */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-[11px] leading-relaxed flex gap-2 items-start">
                <span className="shrink-0 mt-0.5 text-xs">⚠️</span>
                <p>Use EXATAMENTE o mesmo email que você usou na compra para receber o link de acesso.</p>
              </div>
            </div>

            <button
              onClick={onNavigateApp}
              className="mt-6 w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-950/30"
            >
              Ir para o login
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Step 3 */}
          <div className="rounded-2xl border border-slate-850 bg-slate-900/40 p-6 flex flex-col justify-between shadow-xl backdrop-blur-xl hover:border-slate-800 transition-all">
            <div className="space-y-4">
              <span className="inline-flex px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full text-[10px] font-bold tracking-wider uppercase">
                PASSO 3
              </span>
              <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
                <Key className="w-5 h-5 text-indigo-400" />
                Configure sua API
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Nas Configurações do app, insira sua chave da Apify para começar a buscar leads.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="rounded-2xl border border-slate-850 bg-slate-900/40 p-6 flex flex-col justify-between shadow-xl backdrop-blur-xl hover:border-slate-800 transition-all">
            <div className="space-y-4">
              <span className="inline-flex px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full text-[10px] font-bold tracking-wider uppercase">
                PASSO 4
              </span>
              <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                Aprenda a usar
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Acesse o menu Curso dentro da plataforma e aprenda como usar todos os recursos.
              </p>
            </div>

            <button
              onClick={onNavigateApp}
              className="mt-6 w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md"
            >
              Ver o curso
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* WhatsApp support button at the bottom */}
        <div className="flex justify-center mt-12">
          <a
            href="https://wa.me/5585988653086"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-950/20 active:scale-[0.98] cursor-pointer"
          >
            <MessageSquare className="w-5 h-5 shrink-0" />
            Precisa de ajuda? Fale conosco
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-12 px-6 mt-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.jpg" 
              alt="Gera Leads" 
              className="w-8 h-8 rounded-lg shadow-md border border-slate-800" 
            />
            <span className="text-sm font-bold text-white tracking-tight">Gera Leads</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 text-xs text-slate-500">
            <span>&copy; {new Date().getFullYear()} Gera Leads. Todos os direitos reservados.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
