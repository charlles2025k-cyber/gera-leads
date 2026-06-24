import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, Download, MessageSquare, RefreshCw, Key, 
  MapPin, Database, Check, ArrowRight, ShieldCheck, 
  Sparkles, Layers, ChevronDown, X, Users,
  ChevronLeft, ChevronRight
} from 'lucide-react';

export default function LandingPage({ onNavigateApp }) {
  const [openFaq, setOpenFaq] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://player.vimeo.com/api/player.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const cardWidth = window.innerWidth < 640 ? clientWidth * 0.9 + 16 : 320 + 24;
      const scrollTo = direction === 'left' 
        ? scrollLeft - cardWidth 
        : scrollLeft + cardWidth;
      
      scrollRef.current.scrollTo({
        left: scrollTo,
        behavior: 'smooth'
      });
    }
  };

  const faqData = [
    {
      q: "Como funciona o Gera Leads?",
      a: "O Gera Leads busca dados diretamente do Google Maps em tempo real. Você digita o tipo de negócio e a cidade, e o sistema retorna uma lista completa de leads com nome, telefone, endereço e muito mais."
    },
    {
      q: "Preciso instalar algum programa?",
      a: "Não! O Gera Leads funciona 100% no navegador, sem instalação. O ZapFlow é uma extensão do Chrome gratuita para quem assinar o plano Anual."
    },
    {
      q: "Como funciona o disparo de WhatsApp?",
      a: "Após buscar os leads, você pode disparar mensagens diretamente pelo WhatsApp Web usando a extensão ZapFlow. O sistema automatiza os envios respeitando os limites do seu plano."
    },
    {
      q: "Posso cancelar quando quiser?",
      a: "Sim! Você pode cancelar sua assinatura a qualquer momento. O acesso continua ativo até o fim do período já pago."
    },
    {
      q: "Meus dados estão seguros?",
      a: "Sim. Utilizamos criptografia de ponta e infraestrutura segura. Seus dados nunca são compartilhados com terceiros."
    },
    {
      q: "Quanto posso buscar por mês?",
      a: "Depende do seu plano: Mensal tem 500 leads/mês e Anual tem 1.500 leads/mês."
    }
  ];

  const features = [
    {
      icon: Search,
      title: "Busca no Google Maps",
      desc: "Procure qualquer tipo de negócio em qualquer cidade do Brasil. Nossa tecnologia extrai dados fresquinhos do Google Places em tempo real.",
      color: "from-blue-500 to-indigo-600",
      glowColor: "rgba(59, 130, 246, 0.15)",
      img: "/screenshots/busca.png"
    },
    {
      icon: Download,
      title: "Exportação CSV",
      desc: "Baixe todas as informações comerciais (Nome, Telefone, Endereço, Categoria) em um arquivo CSV organizado com apenas um clique.",
      color: "from-emerald-500 to-teal-600",
      glowColor: "rgba(16, 185, 129, 0.15)",
      img: "/screenshots/busca.png"
    },
    {
      icon: MessageSquare,
      title: "Disparo WhatsApp",
      desc: "Aborde dezenas de leads simultaneamente pelo WhatsApp com mensagens dinâmicas e personalizadas contendo o nome e endereço do local.",
      color: "from-green-500 to-emerald-600",
      glowColor: "rgba(34, 197, 94, 0.15)",
      img: "/screenshots/disparo.png"
    },
    {
      icon: RefreshCw,
      title: "Funil de Resposta",
      desc: "Automações inteligentes para continuar o atendimento de leads que responderam positivamente à sua prospecção inicial.",
      color: "from-amber-500 to-orange-600",
      glowColor: "rgba(245, 158, 11, 0.15)",
      img: "/screenshots/funil.png"
    },
    {
      icon: Users,
      title: "Sistema de Grupos WhatsApp",
      desc: "Busque links de grupos de WhatsApp divulgados em redes sociais e na internet para realizar abordagens em massa ou networking segmentado.",
      color: "from-indigo-500 to-purple-600",
      glowColor: "rgba(99, 102, 241, 0.15)",
      img: "/screenshots/busca.png"
    }
  ];

  return (
    <div className="relative min-h-screen bg-[#070b13] text-slate-100 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      
      {/* Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[45%] h-[45%] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-[20%] w-[50%] h-[50%] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />

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
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32 px-4 sm:px-6">
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full text-[10px] sm:text-xs font-semibold animate-pulse-soft max-w-full justify-center">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span>Prospectador de Clientes B2B Automático</span>
          </div>

          <h1 className="text-3xl sm:text-6xl font-black font-display text-white tracking-tight leading-[1.1] max-w-3xl mx-auto">
            Encontre clientes em segundos <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">para o seu negócio</span>
          </h1>

          <div className="max-w-2xl mx-auto space-y-4">
            <p className="text-slate-400 text-sm sm:text-lg leading-relaxed">
              Encontre empresas e clientes qualificados de forma automática através do Google Maps. Nossa plataforma utiliza um sistema inteligente de prospecção para identificar oportunidades reais, filtrar contatos relevantes e automatizar o envio de mensagens pelo WhatsApp.
            </p>
            <p className="text-slate-400 text-sm sm:text-lg leading-relaxed">
              Economize horas de trabalho manual, alcance mais clientes e aumente suas chances de fechar novos negócios com uma solução rápida, prática e eficiente.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 pt-4 w-full max-w-xs sm:max-w-none mx-auto">
            <a
              href="#pricing"
              className="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-indigo-950/30 active:scale-[0.98] text-center"
            >
              Começar agora
            </a>
            <a
              href="#pricing"
              className="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 bg-slate-900/60 hover:bg-slate-850/80 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 font-bold text-sm rounded-xl transition-all active:scale-[0.98] text-center"
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

              {/* YouTube Video Embed inside macOS window */}
              <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-inner border border-slate-900 bg-black">
                <iframe
                  src="https://www.youtube.com/embed/Azr1ZHIIOpE?start=637"
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Demonstration Section */}
      <section className="py-20 border-t border-slate-900 bg-slate-950/20 px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-white">
              Veja como funciona em 2 minutos
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
              Do cadastro ao primeiro lead em menos de 5 minutos
            </p>
          </div>

          <div className="max-w-[900px] mx-auto rounded-2xl border border-slate-800/80 bg-slate-950/40 p-3 sm:p-4 shadow-[0_0_50px_-12px_rgba(99,102,241,0.15)] backdrop-blur-sm">
            <div style={{ padding: '56.25% 0 0 0', position: 'relative' }} className="rounded-xl overflow-hidden border border-slate-900 bg-black">
              <iframe 
                src="https://player.vimeo.com/video/1204285931?badge=0&autopause=0&player_id=0&app_id=58479" 
                frameBorder="0" 
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share" 
                referrerPolicy="strict-origin-when-cross-origin" 
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} 
                title="APRESENTAÇÃO DO GERA LEADS"
              />
            </div>
          </div>

          <div className="pt-4">
            <a
              href="#pricing"
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-indigo-950/30 active:scale-[0.98] cursor-pointer"
            >
              Começar agora
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 border-t border-slate-900 bg-slate-950/20 px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-white">
              Tudo o que você precisa para vender mais
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Plataforma completa focada em conectar você a clientes prontos para comprar seu produto ou serviço, seja digital ou físico, de forma rápida e eficiente.
            </p>
          </div>

          {/* Navigation Arrows & Container */}
          <div className="relative group">
            {/* Left Button */}
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-6 z-10 p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 shadow-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-auto cursor-pointer"
              aria-label="Previous features"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Right Button */}
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-6 z-10 p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 shadow-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-auto cursor-pointer"
              aria-label="Next features"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Scrollable Row */}
            <div 
              ref={scrollRef}
              className="flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-6 pt-2"
              style={{
                scrollbarWidth: 'none', /* Firefox */
                msOverflowStyle: 'none', /* IE/Edge */
              }}
            >
              <style>{`
                div::-webkit-scrollbar {
                  display: none !important;
                }
              `}</style>

              {features.map((feat, idx) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={idx}
                    className="snap-start shrink-0 w-[90%] sm:w-[320px] rounded-2xl border border-slate-850 bg-slate-950/40 p-6 flex flex-col justify-between shadow-lg backdrop-blur-sm relative overflow-hidden transition-all duration-300 hover:border-slate-800 hover:bg-slate-950/60"
                  >
                    {/* Glow effect matching feature color */}
                    <div 
                      className="absolute top-0 right-0 w-[120px] h-[120px] rounded-full blur-[40px] opacity-10 pointer-events-none"
                      style={{
                        background: `radial-gradient(circle, ${feat.glowColor || 'rgba(99, 102, 241, 0.5)'} 0%, transparent 70%)`
                      }}
                    />

                    {/* Top Row: Icon & Title */}
                    <div className="space-y-4">
                      <div className={`w-fit p-3 rounded-xl bg-gradient-to-tr ${feat.color} text-white shadow-md`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-white font-display">
                        {feat.title}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed min-h-[48px]">
                        {feat.desc}
                      </p>
                    </div>

                    {/* Image Area */}
                    <div className="mt-6 relative rounded-lg overflow-hidden border border-slate-900 bg-slate-950/80 aspect-[4/3] flex items-center justify-center">
                      <img
                        src={feat.img}
                        alt={feat.title}
                        className="max-h-full max-w-full object-contain rounded-lg p-1.5"
                      />
                      {/* Blur overlay for WhatsApp conversations */}
                      {(feat.img === '/screenshots/disparo.png' || feat.img === '/screenshots/funil.png') && (
                        <div 
                          className="absolute inset-y-0 left-0 w-[34%] pointer-events-none backdrop-blur-[4px] bg-[#070b13]/10 border-r border-white/5 rounded-l-lg"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 border-t border-slate-900 px-6" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120,119,198,0.2), transparent)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-white">
              Conheça nossos Planos
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Assine hoje e tenha acesso imediato à plataforma e suas funcionalidades exclusivas de prospecção.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-3xl mx-auto">
            {/* Mensal */}
            <div className="p-8 rounded-2xl bg-[#0a0f1d]/50 backdrop-blur-xl flex flex-col justify-between hover:border-slate-700/80 transition-all shadow-xl" style={{ border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 -20px 80px -20px #8686f01f inset' }}>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white font-display">Mensal</h3>
                  <p className="text-slate-400 text-xs mt-1">Ideal para experimentar o buscador.</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">R$ 67</span>
                  <span className="text-slate-500 text-xs">/mês</span>
                </div>

                <ul className="space-y-3.5 text-xs text-slate-350 border-t border-slate-850 pt-6">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Até 500 leads por mês</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Acesso completo ao Google Places Crawler</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Filtro automático de leads sem website</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Exportação ilimitada para CSV</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Disparador inteligente Zapflow extensão</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Buscador de Grupos de WhatsApp</span>
                  </li>
                  <li className="flex items-center gap-2 opacity-40">
                    <X className="w-4 h-4 text-red-500 shrink-0" />
                    <span className="line-through">Suporte prioritário</span>
                  </li>
                  <li className="flex items-center gap-2 opacity-40">
                    <X className="w-4 h-4 text-red-500 shrink-0" />
                    <span className="line-through">Curso completo de renda extra</span>
                  </li>
                  <li className="flex items-center gap-2 opacity-40">
                    <X className="w-4 h-4 text-red-500 shrink-0" />
                    <span className="line-through">Grupo VIP de suporte</span>
                  </li>
                  <li className="flex items-center gap-2 opacity-40">
                    <X className="w-4 h-4 text-red-500 shrink-0" />
                    <span className="line-through">Reuniões mensais com estratégias</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <a
                  href="https://pay.cakto.com.br/mihqmub_933107"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3.5 bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs rounded-xl transition-all inline-flex items-center justify-center gap-2 shadow-md"
                >
                  Começar Mensal
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Anual */}
            <div className="p-8 rounded-2xl bg-[#0a0f1d]/50 backdrop-blur-xl flex flex-col justify-between hover:border-slate-700/80 transition-all shadow-xl" style={{ border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 -20px 80px -20px #8686f01f inset' }}>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white font-display">Anual</h3>
                    <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full text-[9px] font-bold uppercase tracking-wider">Popular</span>
                  </div>
                  <p className="text-slate-400 text-xs mt-1">Acesso completo por 12 meses.</p>
                </div>

                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">R$ 197</span>
                    <span className="text-slate-500 text-xs">/ano</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold block mt-1">Equivalente a R$ 16,41/mês</span>
                </div>

                <ul className="space-y-3.5 text-xs text-slate-350 border-t border-slate-850 pt-6">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Até 1.500 leads por mês</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Acesso completo ao Google Places Crawler</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Filtro automático de leads sem website</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Exportação ilimitada para CSV</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Disparador inteligente Zapflow extensão</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Buscador de Grupos de WhatsApp</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Suporte prioritário</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Curso completo de renda extra</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Grupo VIP de suporte</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Reuniões mensais com estratégias</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <a
                  href="https://pay.cakto.com.br/cx86ktu"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl transition-all inline-flex items-center justify-center gap-2 shadow-lg hover:shadow-indigo-500/10 active:scale-[0.98] cursor-pointer"
                >
                  Começar Anual
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 border-t border-slate-900 px-6 bg-slate-950/10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-white">
              Perguntas Frequentes (FAQ)
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Tire suas principais dúvidas sobre o funcionamento do Gera Leads e do ZapFlow.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqData.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx}
                  className="rounded-xl bg-[#0a0f1d]/30 border border-slate-900 hover:border-slate-800/80 transition-all overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-slate-200 hover:text-white text-sm sm:text-base gap-4 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-slate-450 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 text-slate-400 text-xs sm:text-sm leading-relaxed border-t border-slate-900/60 pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-12 px-6">
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
