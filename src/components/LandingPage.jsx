import React, { useState } from 'react';
import { 
  Search, Download, MessageSquare, RefreshCw, Key, 
  MapPin, Database, Check, ArrowRight, ShieldCheck, 
  Sparkles, Layers
} from 'lucide-react';

export default function LandingPage({ onNavigateApp }) {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: Search,
      title: "Busca no Google Maps",
      desc: "Procure qualquer tipo de negócio em qualquer cidade do Brasil. Nossa tecnologia extrai dados fresquinhos do Google Places em tempo real.",
      color: "from-blue-500 to-indigo-600",
      glowColor: "rgba(59, 130, 246, 0.15)"
    },
    {
      icon: Download,
      title: "Exportação CSV",
      desc: "Baixe todas as informações comerciais (Nome, Telefone, Endereço, Categoria) em um arquivo CSV organizado com apenas um clique.",
      color: "from-emerald-500 to-teal-600",
      glowColor: "rgba(16, 185, 129, 0.15)"
    },
    {
      icon: MessageSquare,
      title: "Disparo WhatsApp",
      desc: "Aborde dezenas de leads simultaneamente pelo WhatsApp com mensagens dinâmicas e personalizadas contendo o nome e endereço do local.",
      color: "from-green-500 to-emerald-600",
      glowColor: "rgba(34, 197, 94, 0.15)"
    },
    {
      icon: RefreshCw,
      title: "Funil de Resposta",
      desc: "Automações inteligentes para continuar o atendimento de leads que responderam positivamente à sua prospecção inicial.",
      color: "from-amber-500 to-orange-600",
      glowColor: "rgba(245, 158, 11, 0.15)"
    },
    {
      icon: Key,
      title: "Integração ZapFlow",
      desc: "Vincule sua chave ZapFlow diretamente na plataforma para usufruir de envios integrados em massa e automações avançadas.",
      color: "from-indigo-500 to-purple-600",
      glowColor: "rgba(99, 102, 241, 0.15)"
    }
  ];

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      
      {/* Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[45%] h-[45%] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-5%] left-[20%] w-[50%] h-[50%] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#070b13]/80 backdrop-blur-xl border-b border-slate-900/60 transition-all">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/favicon.svg" 
              alt="Gera Leads" 
              className="w-10 h-10 rounded-xl shadow-lg border border-slate-800" 
            />
            <span className="text-lg font-bold text-white tracking-tight font-display">
              Gera Leads
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Recursos</a>
            <a href="#pricing" className="hover:text-white transition-colors">Planos</a>
          </nav>

          <button
            onClick={onNavigateApp}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-850 text-slate-200 hover:text-white border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-semibold tracking-wide transition-all active:scale-[0.98] cursor-pointer shadow-md"
          >
            Acessar Plataforma
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32 px-6">
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
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full text-xs font-semibold animate-pulse-soft">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Prospectador de Clientes B2B Automático</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black font-display text-white tracking-tight leading-[1.1] max-w-3xl mx-auto">
            Encontre clientes em <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">segundos</span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Busque leads qualificados no Google Maps e dispare mensagens pelo WhatsApp automaticamente. Filtre estabelecimentos que não possuem website e aborde-os na hora!
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <a
              href="#pricing"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-indigo-950/30 active:scale-[0.98] text-center"
            >
              Começar agora
            </a>
            <a
              href="#pricing"
              className="w-full sm:w-auto px-8 py-4 bg-slate-900/60 hover:bg-slate-850/80 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 font-bold text-sm rounded-xl transition-all active:scale-[0.98] text-center"
            >
              Ver planos
            </a>
          </div>

          {/* Interactive Mockup Container */}
          <div className="pt-16 max-w-5xl mx-auto">
            <div className="relative rounded-2xl border border-slate-800/80 bg-slate-950/40 p-4 shadow-2xl backdrop-blur-sm overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              
              {/* Window Buttons */}
              <div className="flex gap-1.5 mb-4 border-b border-slate-900 pb-3">
                <span className="w-3 h-3 rounded-full bg-red-500/30" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/30" />
                <span className="w-3 h-3 rounded-full bg-green-500/30" />
              </div>

              {/* Pseudo UI representation of the Dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-left">
                {/* Sidebar */}
                <div className="md:col-span-3 space-y-4 pr-2 border-r border-slate-900/60 hidden md:block">
                  <div className="h-6 w-24 bg-slate-800/40 rounded-lg animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-9 bg-indigo-600/10 border border-indigo-500/20 rounded-xl flex items-center px-3 gap-2">
                      <div className="w-3.5 h-3.5 rounded bg-indigo-400" />
                      <div className="h-3 w-16 bg-indigo-300/40 rounded" />
                    </div>
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-9 hover:bg-slate-900/30 rounded-xl flex items-center px-3 gap-2">
                        <div className="w-3.5 h-3.5 rounded bg-slate-700" />
                        <div className="h-3 w-16 bg-slate-650 rounded" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Main Content Pane */}
                <div className="md:col-span-9 space-y-5 pl-0 md:pl-2">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="space-y-1.5">
                      <div className="h-5 w-32 bg-slate-250 rounded-lg" />
                      <div className="h-3.5 w-48 bg-slate-500/40 rounded" />
                    </div>
                    <div className="h-8 w-24 bg-emerald-600/20 border border-emerald-500/20 rounded-lg" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { l: "Buscas Ativas", v: "148" },
                      { l: "Leads Coletados", v: "2.842" },
                      { l: "Taxa de Resposta", v: "18.4%" }
                    ].map((card, idx) => (
                      <div key={idx} className="p-4 bg-slate-900/40 border border-slate-850 rounded-xl">
                        <span className="text-[10px] text-slate-500 block font-semibold uppercase tracking-wider">{card.l}</span>
                        <span className="text-xl font-bold text-white block mt-1">{card.v}</span>
                      </div>
                    ))}
                  </div>

                  {/* Dummy Table */}
                  <div className="border border-slate-850 rounded-xl overflow-hidden bg-slate-950/20">
                    <div className="bg-slate-900/20 p-3 border-b border-slate-850 flex justify-between">
                      <div className="h-3 w-28 bg-slate-600/40 rounded" />
                      <div className="h-3 w-12 bg-slate-600/40 rounded" />
                    </div>
                    <div className="p-3 space-y-3">
                      {[
                        { n: "Barbearia do João", e: "Fortaleza, CE", s: "Sem Site", p: "📱 WhatsApp" },
                        { n: "Pet Shop Amigo Animal", e: "Fortaleza, CE", s: "Sem Site", p: "📱 WhatsApp" }
                      ].map((row, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[11px] border-b border-slate-900 last:border-0 pb-2 last:pb-0">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-200">{row.n}</span>
                            <span className="text-[10px] text-slate-500">{row.e}</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">{row.s}</span>
                            <span className="px-2 py-0.5 rounded bg-green-600/15 border border-green-500/30 text-green-400 font-semibold">{row.p}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 border-t border-slate-900 bg-slate-950/20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-white">
              Tudo o que você precisa para vender mais
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Desenvolvemos um ecossistema completo focado em maximizar sua taxa de prospecção e fechamentos comerciais.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Side: Buttons */}
            <div className="lg:col-span-5 space-y-3.5">
              {features.map((feat, idx) => {
                const Icon = feat.icon;
                const isActive = activeFeature === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveFeature(idx)}
                    className={`w-full text-left p-5 rounded-2xl transition-all border flex items-start gap-4 cursor-pointer ${
                      isActive 
                        ? 'bg-slate-900/60 border-slate-800 shadow-xl' 
                        : 'bg-transparent border-transparent hover:bg-slate-900/20 hover:border-slate-900/50'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${feat.color} text-white shrink-0 shadow-md`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className={`text-sm font-bold transition-colors ${isActive ? 'text-white' : 'text-slate-350'}`}>
                        {feat.title}
                      </h3>
                      <p className={`text-xs mt-1 leading-relaxed ${isActive ? 'text-slate-400' : 'text-slate-500'}`}>
                        {isActive ? feat.desc : "Clique para ver detalhes"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Side: Showcase Box */}
            <div className="lg:col-span-7">
              <div 
                className="relative rounded-2xl border border-slate-800/80 p-8 shadow-2xl backdrop-blur-xl h-[380px] flex flex-col justify-between transition-all duration-500 overflow-hidden"
                style={{ 
                  backgroundColor: 'rgba(9, 13, 22, 0.4)',
                  boxShadow: `0 20px 25px -5px ${features[activeFeature].glowColor}`
                }}
              >
                {/* Decorative glowing background item */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-tr ${features[activeFeature].color} opacity-10 rounded-full blur-2xl`} />

                <div className="space-y-6 relative z-10">
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest block">Recurso em destaque</span>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold font-display text-white">{features[activeFeature].title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                      {features[activeFeature].desc}
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-900 pt-6 relative z-10">
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Incluso em todas as licenças aplicáveis</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 border-t border-slate-900 px-6" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120,119,198,0.2), transparent)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-white">
              Planos simples e transparentes
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Assine hoje e tenha acesso imediato à plataforma e suas funcionalidades exclusivas de prospecção.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
            {/* Mensal */}
            <div className="p-8 rounded-2xl bg-[#0a0f1d]/50 backdrop-blur-xl flex flex-col justify-between hover:border-slate-700/80 transition-all shadow-xl" style={{ border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 -20px 80px -20px #8686f01f inset' }}>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white font-display">Mensal</h3>
                  <p className="text-slate-400 text-xs mt-1">Ideal para experimentar o buscador.</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">R$ 47</span>
                  <span className="text-slate-500 text-xs">/mês</span>
                </div>

                <ul className="space-y-3.5 text-xs text-slate-350 border-t border-slate-850 pt-6">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>500 leads por mês</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Google Places Crawler</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Filtro de leads sem website</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Exportação para CSV</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <a
                  href="https://pay.cakto.com.br/mihqmub_93310747"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3.5 bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs rounded-xl transition-all inline-flex items-center justify-center gap-2 shadow-md"
                >
                  Começar Mensal
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Trimestral */}
            <div className="p-8 rounded-2xl bg-[#0a0f1d]/50 backdrop-blur-xl flex flex-col justify-between hover:border-slate-700/80 transition-all shadow-2xl relative overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 -20px 80px -20px #8686f01f inset' }}>
              {/* Popular Tag */}
              <div className="absolute top-0 right-0 bg-indigo-500 text-white px-4 py-1 rounded-bl-xl text-[10px] font-black uppercase tracking-wider">
                Melhor Custo-Benefício
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white font-display">Trimestral</h3>
                  <p className="text-slate-400 text-xs mt-1">O preferido dos profissionais autônomos.</p>
                </div>

                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">R$ 97</span>
                    <span className="text-slate-500 text-xs">/trimestre</span>
                  </div>
                  <span className="text-[10px] text-indigo-400 font-bold block mt-1">Economize R$44</span>
                </div>

                <ul className="space-y-3.5 text-xs text-slate-300 border-t border-slate-850 pt-6">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>1.500 leads por mês</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Google Places Crawler</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Filtro de leads sem website</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Exportação para CSV</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Disparador inteligente WhatsApp</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Curso Renda Extra</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Suporte Prioritário</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <a
                  href="https://pay.cakto.com.br/36bmrgk"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all inline-flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/40"
                >
                  Começar Trimestral
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Anual */}
            <div className="p-8 rounded-2xl bg-[#0a0f1d]/50 backdrop-blur-xl flex flex-col justify-between hover:border-slate-700/80 transition-all shadow-xl" style={{ border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 -20px 80px -20px #8686f01f inset' }}>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white font-display">Anual</h3>
                  <p className="text-slate-400 text-xs mt-1">Para agências e equipes consolidadas.</p>
                </div>

                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">R$ 197</span>
                    <span className="text-slate-500 text-xs">/ano</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold block mt-1">Economize R$367</span>
                </div>

                <ul className="space-y-3.5 text-xs text-slate-350 border-t border-slate-850 pt-6">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>5.000 leads por mês</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Google Places Crawler</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Filtro de leads sem website</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Exportação para CSV</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Disparador inteligente WhatsApp</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Curso Renda Extra</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Grupo VIP de suporte + Encontros</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <a
                  href="https://pay.cakto.com.br/cx86ktu"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3.5 bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs rounded-xl transition-all inline-flex items-center justify-center gap-2 shadow-md"
                >
                  Começar Anual
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div className="flex items-center gap-3">
            <img 
              src="/favicon.svg" 
              alt="Gera Leads" 
              className="w-8 h-8 rounded-lg shadow-md border border-slate-800" 
            />
            <span className="text-sm font-bold text-white tracking-tight">Gera Leads</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 text-xs text-slate-500">
            <span>&copy; {new Date().getFullYear()} Gera Leads. Todos os direitos reservados.</span>
            <button
              onClick={onNavigateApp}
              className="text-indigo-400 hover:underline hover:text-indigo-300 font-semibold cursor-pointer"
            >
              Já possui uma conta? Acessar a Plataforma
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
