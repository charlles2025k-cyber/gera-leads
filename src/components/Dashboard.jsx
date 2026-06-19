import React, { useState, useEffect, useMemo } from 'react';
import { 
  Key, Eye, EyeOff, Search, Download, LogOut, ShieldCheck, 
  MapPin, Sliders, Database, AlertCircle, FileSpreadsheet,
  CheckCircle, RefreshCw, Layers, ExternalLink, HelpCircle,
  Settings, MessageSquare, Send, CreditCard, BarChart3, Clock, User
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, PieChart, Pie, Cell 
} from 'recharts';

export default function Dashboard({ user, onLogout }) {
  // Navigation State
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'search' | 'plans' | 'settings'

  // States
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeySaved, setApiKeySaved] = useState(false);

  // Form States
  const [searchQuery, setSearchQuery] = useState('barbearia');
  const [locationQuery, setLocationQuery] = useState('Fortaleza, CE');
  const [maxPlaces, setMaxPlaces] = useState(20);

  // App States
  const [loading, setLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [error, setError] = useState('');
  const [results, setResults] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [selectedPlace, setSelectedPlace] = useState(null);

  // WhatsApp & Dispatch States
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [messageTemplate, setMessageTemplate] = useState(
    'Olá {nome}, tudo bem? Vimos seu estabelecimento no endereço {endereco} e percebemos que não possui site cadastrado. Teriam interesse em criar uma presença online?'
  );
  const [dispatchStatus, setDispatchStatus] = useState({}); // leadIdx -> 'pending' | 'sending' | 'sent' | 'error'
  const [dispatching, setDispatching] = useState(false);

  // Database Search History States
  const [searchHistory, setSearchHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Plan Expiration State
  const [planInfo, setPlanInfo] = useState(() => {
    const saved = localStorage.getItem('user_plan_info');
    if (saved) return JSON.parse(saved);
    
    // Default mock plan: Trimestral, expiring in 15 days
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + 15);
    return {
      name: 'Trimestral',
      expirationDate: expDate.toISOString().split('T')[0],
      daysRemaining: 15
    };
  });

  // Load API key, previous results, and history on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('apify_api_key') || '';
    setApiKey(savedKey);
    if (savedKey) {
      setApiKeySaved(true);
    }

    // Refresh remaining days based on saved expiration date
    const exp = new Date(planInfo.expirationDate);
    const today = new Date();
    const diffTime = exp - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setPlanInfo(prev => {
      const updated = { ...prev, daysRemaining: diffDays };
      localStorage.setItem('user_plan_info', JSON.stringify(updated));
      return updated;
    });

    fetchSearchHistory();
  }, []);

  // Fetch search history from Supabase
  const fetchSearchHistory = async () => {
    setLoadingHistory(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data, error } = await supabase
          .from('lead_searches')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: true });
        if (error) throw error;
        setSearchHistory(data || []);
      }
    } catch (err) {
      console.error("Erro ao carregar histórico de buscas:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Save API Key
  const handleSaveApiKey = (e) => {
    e.preventDefault();
    localStorage.setItem('apify_api_key', apiKey);
    setApiKeySaved(true);
    // Visual indicator
    const btn = document.getElementById('save-key-btn');
    if (btn) {
      btn.classList.add('bg-emerald-600');
      setTimeout(() => {
        btn.classList.remove('bg-emerald-600');
      }, 1500);
    }
  };

  const getCleanPhone = (phoneStr) => {
    let cleaned = phoneStr.replace(/\D/g, '');
    if (cleaned.length === 10 || cleaned.length === 11) {
      cleaned = '55' + cleaned;
    }
    return cleaned;
  };

  const handleBulkDispatch = async () => {
    if (!apiKey) {
      setError('Por favor, configure e salve sua API Key do Apify para enviar mensagens.');
      return;
    }

    if (selectedLeads.length === 0) return;

    setDispatching(true);

    const initialStatus = { ...dispatchStatus };
    selectedLeads.forEach(idx => {
      initialStatus[idx] = 'pending';
    });
    setDispatchStatus(initialStatus);

    for (let i = 0; i < selectedLeads.length; i++) {
      const leadIdx = selectedLeads[i];
      const lead = results[leadIdx];
      
      setDispatchStatus(prev => ({ ...prev, [leadIdx]: 'sending' }));

      const formattedMessage = messageTemplate
        .replace(/{nome}/g, lead.title || '')
        .replace(/{endereco}/g, lead.address || '')
        .replace(/{telefone}/g, lead.phone || '');

      const cleanedPhone = getCleanPhone(lead.phone);

      try {
        const response = await fetch(
          `https://api.apify.com/v2/acts/TCZgliqsdbWeVYdq6/runs?token=${apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'sendMessage',
              phone: cleanedPhone,
              message: formattedMessage
            })
          }
        );

        if (!response.ok) {
          throw new Error(`Falha no envio (${response.status})`);
        }

        setDispatchStatus(prev => ({ ...prev, [leadIdx]: 'sent' }));
      } catch (err) {
        console.error(`Erro ao disparar para ${lead.title}:`, err);
        setDispatchStatus(prev => ({ ...prev, [leadIdx]: 'error' }));
      }

      if (i < selectedLeads.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }

    setDispatching(false);
  };

  // Perform search
  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setResults([]);
    setSelectedLeads([]);
    setDispatchStatus({});

    if (!apiKey) {
      setError('Por favor, configure e salve sua API Key do Apify para realizar buscas reais.');
      return;
    }

    if (!searchQuery.trim()) {
      setError('Por favor, informe o termo de pesquisa (o que buscar).');
      return;
    }

    if (!locationQuery.trim()) {
      setError('Por favor, informe a cidade/estado para a busca.');
      return;
    }

    const maxCount = Math.min(100, Math.max(1, parseInt(maxPlaces) || 10));

    setLoading(true);
    setProgressMsg('Enviando requisição síncrona para o Apify (isso pode levar até 2 minutos)...');
    
    try {
      const response = await fetch(
        `https://api.apify.com/v2/acts/compass~crawler-google-places/run-sync-get-dataset-items?token=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            searchStringsArray: [`${searchQuery.trim()} in ${locationQuery.trim()}`],
            locationQuery: locationQuery.trim(),
            maxCrawledPlacesPerSearch: maxCount,
            language: "pt-BR",
            skipClosedPlaces: true,
            website: "withoutWebsite"
          })
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Falha na API do Apify (${response.status}): ${errText || response.statusText}`);
      }

      const data = await response.json();
      
      if (Array.isArray(data)) {
        // Normalize results: title, address, phone, website, categoryName
        const normalized = data.map(item => ({
          title: item.title || item.name || 'Sem título',
          address: item.address || item.street || 'Endereço não informado',
          phone: item.phone || item.phoneNormalized || 'Telefone não disponível',
          website: item.website || item.websiteUrl || 'Sem Website',
          categoryName: item.categoryName || item.subTitle || 'Outros'
        }));
        setResults(normalized);

        // Save to Supabase searches log
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            await supabase.from('lead_searches').insert({
              user_id: session.user.id,
              search_term: searchQuery.trim(),
              location: locationQuery.trim(),
              total_results: normalized.length
            });
            fetchSearchHistory();
          }
        } catch (dbErr) {
          console.error("Erro ao salvar busca no Supabase:", dbErr);
        }
      } else {
        throw new Error('Formato de dados retornado inválido. Esperava-se uma lista.');
      }

    } catch (err) {
      console.error(err);
      setError(`Ocorreu um erro ao buscar dados no Apify: ${err.message}. Verifique sua chave API ou limites de créditos.`);
    } finally {
      setLoading(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (results.length === 0) return;

    const headers = ['Título', 'Endereço', 'Telefone', 'Website', 'Categoria'];
    const csvRows = [];
    csvRows.push(headers.join(';'));

    results.forEach(item => {
      const row = [
        item.title,
        item.address,
        item.phone,
        item.website,
        item.categoryName
      ].map(val => {
        const escaped = String(val).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(row.join(';'));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const sanitizedQuery = searchQuery.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const sanitizedLoc = locationQuery.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const filename = `leads_${sanitizedQuery}_${sanitizedLoc}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter local results in UI
  const filteredResults = results.filter(item => {
    const text = filterText.toLowerCase();
    return (
      item.title.toLowerCase().includes(text) ||
      item.address.toLowerCase().includes(text) ||
      item.phone.toLowerCase().includes(text) ||
      item.categoryName.toLowerCase().includes(text)
    );
  });

  // Calculate Metrics from history
  const metrics = useMemo(() => {
    const totalLeads = searchHistory.reduce((sum, item) => sum + item.total_results, 0);

    const todayStr = new Date().toISOString().split('T')[0];
    const leadsToday = searchHistory
      .filter(item => item.created_at.startsWith(todayStr))
      .reduce((sum, item) => sum + item.total_results, 0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const leadsThisWeek = searchHistory
      .filter(item => new Date(item.created_at) >= sevenDaysAgo)
      .reduce((sum, item) => sum + item.total_results, 0);

    // Line Chart: leads per day for last 7 days
    const lineChartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const displayDate = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      
      const leadsOnDay = searchHistory
        .filter(item => item.created_at.startsWith(dateStr))
        .reduce((sum, item) => sum + item.total_results, 0);
        
      lineChartData.push({
        name: displayDate,
        leads: leadsOnDay
      });
    }

    // Pie Chart: categories grouping
    const categoryMap = {};
    searchHistory.forEach(item => {
      const term = (item.search_term || 'Outros').trim().toLowerCase();
      categoryMap[term] = (categoryMap[term] || 0) + item.total_results;
    });

    const COLORS = ['#3b82f6', '#6366f1', '#10b981', '#f59e0b', '#ec4899'];
    const pieChartData = Object.keys(categoryMap).map((key, index) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: categoryMap[key],
      color: COLORS[index % COLORS.length]
    })).sort((a, b) => b.value - a.value).slice(0, 5);

    return {
      totalLeads,
      leadsToday,
      leadsThisWeek,
      lineChartData,
      pieChartData
    };
  }, [searchHistory]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#070b13] text-slate-100 font-sans">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:w-64 bg-slate-900/40 border-r border-slate-800/80 p-6 flex-col justify-between h-screen sticky top-0 backdrop-blur-xl">
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl text-white shadow-md shadow-blue-500/10">
              <Layers className="w-5 h-5 animate-pulse-soft" />
            </div>
            <div>
              <h1 className="text-base font-bold font-display text-white tracking-tight leading-none">
                Gera Leads
              </h1>
              <span className="text-[10px] text-slate-500 block mt-1">Google Places Prospect</span>
            </div>
          </div>

          {/* User Profile */}
          <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/10 flex items-center justify-center font-bold text-sm shrink-0">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-white block truncate leading-none">{user.name}</span>
              <span className="text-[9px] text-slate-500 block truncate mt-1">{user.email}</span>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all border border-transparent cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/20 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850/30'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all border border-transparent cursor-pointer ${
                activeTab === 'search'
                  ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/20 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850/30'
              }`}
            >
              <Search className="w-4 h-4" />
              Gerar Leads
            </button>
            <button
              onClick={() => setActiveTab('plans')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all border border-transparent cursor-pointer ${
                activeTab === 'plans'
                  ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/20 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850/30'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              Planos
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all border border-transparent cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/20 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850/30'
              }`}
            >
              <Settings className="w-4 h-4" />
              Configurações
            </button>
          </nav>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 border border-slate-850 hover:border-red-500/30 hover:bg-red-500/10 text-slate-450 hover:text-red-400 rounded-xl text-xs font-semibold transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Sair da Conta
        </button>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0a0f1b]/95 border-t border-slate-850 backdrop-blur-lg flex items-center justify-around z-40 px-2">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 text-[9px] font-semibold transition-colors cursor-pointer ${
            activeTab === 'dashboard' ? 'text-indigo-400 font-bold' : 'text-slate-500'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Métricas
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`flex flex-col items-center gap-1 text-[9px] font-semibold transition-colors cursor-pointer ${
            activeTab === 'search' ? 'text-indigo-400 font-bold' : 'text-slate-500'
          }`}
        >
          <Search className="w-4 h-4" />
          Buscar
        </button>
        <button
          onClick={() => setActiveTab('plans')}
          className={`flex flex-col items-center gap-1 text-[9px] font-semibold transition-colors cursor-pointer ${
            activeTab === 'plans' ? 'text-indigo-400 font-bold' : 'text-slate-500'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Planos
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1 text-[9px] font-semibold transition-colors cursor-pointer ${
            activeTab === 'settings' ? 'text-indigo-400 font-bold' : 'text-slate-500'
          }`}
        >
          <Settings className="w-4 h-4" />
          Ajustes
        </button>
        <button
          onClick={onLogout}
          className="flex flex-col items-center gap-1 text-[9px] font-semibold text-slate-500 hover:text-red-400 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </nav>

      {/* Main Area */}
      <main className="flex-1 min-h-screen pb-20 md:pb-8 p-4 md:p-8 overflow-y-auto">
        {/* Render Tab Contents */}

        {/* Tab 1: Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-900 pb-5">
              <div>
                <h2 className="text-2xl font-bold font-display text-white">Painel Geral</h2>
                <p className="text-slate-400 text-xs mt-1">Visão integrada das buscas e leads coletados</p>
              </div>
              <button
                onClick={fetchSearchHistory}
                className="p-2 border border-slate-800 hover:border-slate-700 hover:bg-slate-850/30 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                disabled={loadingHistory}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingHistory ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-6 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-xl flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-slate-405 text-xs block font-medium">Total de Leads Coletados</span>
                  <span className="text-2xl font-bold text-white block mt-0.5">{metrics.totalLeads}</span>
                </div>
              </div>

              <div className="p-6 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-xl flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-slate-405 text-xs block font-medium">Leads Hoje</span>
                  <span className="text-2xl font-bold text-white block mt-0.5">{metrics.leadsToday}</span>
                </div>
              </div>

              <div className="p-6 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-xl flex items-center gap-4">
                <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-slate-405 text-xs block font-medium">Leads esta Semana</span>
                  <span className="text-2xl font-bold text-white block mt-0.5">{metrics.leadsThisWeek}</span>
                </div>
              </div>
            </div>

            {/* Charts section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Line chart */}
              <div className="lg:col-span-8 p-6 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-xl">
                <h3 className="text-sm font-bold font-display text-white mb-6">Volume por dia (Últimos 7 dias)</h3>
                <div className="h-64 w-full">
                  {metrics.totalLeads === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                      Nenhuma busca registrada. Comece a capturar leads na aba "Gerar Leads".
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={metrics.lineChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1c253b" />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                        <YAxis stroke="#64748b" fontSize={10} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                          labelStyle={{ color: '#94a3b8' }}
                        />
                        <Line type="monotone" dataKey="leads" stroke="#6366f1" strokeWidth={2} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Pie chart */}
              <div className="lg:col-span-4 p-6 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-xl">
                <h3 className="text-sm font-bold font-display text-white mb-6">Buscas por Termo</h3>
                <div className="h-64 w-full flex flex-col justify-between">
                  {metrics.pieChartData.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                      Sem buscas registradas.
                    </div>
                  ) : (
                    <>
                      <div className="h-44 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={metrics.pieChartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={65}
                              paddingAngle={4}
                              dataKey="value"
                            >
                              {metrics.pieChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      
                      {/* Legend */}
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {metrics.pieChartData.map((item, index) => (
                          <div key={index} className="flex items-center gap-1.5 text-[10px]">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                            <span className="text-slate-300 truncate max-w-[80px] font-medium" title={item.name}>{item.name}</span>
                            <span className="text-slate-500 font-mono">({item.value})</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Gerar Leads (Current Search UI) */}
        {activeTab === 'search' && (
          <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="border-b border-slate-900 pb-5">
              <h2 className="text-2xl font-bold font-display text-white">Gerar Leads</h2>
              <p className="text-slate-400 text-xs mt-1">Busque leads altamente segmentados usando o Google Places</p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Form */}
              <div className="lg:col-span-4 space-y-6">
                <div className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 shadow-xl">
                  <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-3">
                    <Sliders className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-sm font-bold font-display text-white">Parâmetros de Busca</h3>
                  </div>

                  <form onSubmit={handleSearch} className="space-y-5">
                    <div>
                      <label className="block text-slate-350 text-xs font-semibold mb-1.5">Termo de Busca</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                          <Search className="w-4 h-4" />
                        </span>
                        <input
                          type="text"
                          className="w-full pl-9 pr-4 py-2.5 bg-slate-950/50 border border-slate-850 focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/50 rounded-xl text-xs text-white placeholder-slate-650 outline-none transition-all"
                          placeholder="Ex: barbearia, pet shop"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          disabled={loading}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-355 text-xs font-semibold mb-1.5">Localização</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                          <MapPin className="w-4 h-4" />
                        </span>
                        <input
                          type="text"
                          className="w-full pl-9 pr-4 py-2.5 bg-slate-950/50 border border-slate-850 focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/50 rounded-xl text-xs text-white placeholder-slate-650 outline-none transition-all"
                          placeholder="Ex: Fortaleza, CE"
                          value={locationQuery}
                          onChange={(e) => setLocationQuery(e.target.value)}
                          disabled={loading}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-355 text-xs font-semibold mb-1.5">Máx. Resultados</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        className="w-full px-3 py-2.5 bg-slate-950/50 border border-slate-850 focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/50 rounded-xl text-xs text-white placeholder-slate-650 outline-none transition-all"
                        value={maxPlaces}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val)) {
                            setMaxPlaces(Math.min(100, Math.max(1, val)));
                          } else {
                            setMaxPlaces('');
                          }
                        }}
                        onBlur={() => {
                          if (maxPlaces === '') {
                            setMaxPlaces(20);
                          }
                        }}
                        disabled={loading}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg hover:shadow-blue-500/10 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Buscando...
                        </>
                      ) : (
                        <>
                          <Database className="w-4 h-4" />
                          Buscar Leads
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* Data Grid View */}
              <div className="lg:col-span-8">
                {error && (
                  <div className="p-4 mb-6 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-start gap-3 text-xs animate-fade-in">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <div>
                      <span className="font-bold block">Erro na Consulta</span>
                      <span className="mt-1 block leading-relaxed">{error}</span>
                    </div>
                  </div>
                )}

                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-xl min-h-[500px] flex flex-col justify-between">
                  {loading ? (
                    <div className="flex-1 flex flex-col justify-center items-center py-12">
                      <div className="relative mb-6">
                        <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                        <Database className="w-6 h-6 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
                      </div>
                      <h4 className="text-white text-base font-semibold font-display mb-2">Processando Leads</h4>
                      <p className="text-slate-400 text-xs text-center max-w-sm px-4 leading-relaxed animate-pulse">
                        {progressMsg}
                      </p>
                    </div>
                  ) : results.length > 0 ? (
                    <div className="flex-grow flex flex-col h-full">
                      {/* Action headers */}
                      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 border-b border-slate-800 pb-5">
                        <div>
                          <h3 className="text-white font-bold font-display text-base flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-emerald-400" />
                            Resultados da Busca
                          </h3>
                          <p className="text-slate-400 text-xs mt-1">
                            Encontramos {results.length} leads sem website cadastrado.
                          </p>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <input
                            type="text"
                            placeholder="Filtrar nesta lista..."
                            className="px-3 py-2 bg-slate-950/50 border border-slate-850 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-xs text-white placeholder-slate-655 outline-none w-full sm:w-48 transition-all"
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                          />

                          <button
                            onClick={handleExportCSV}
                            className="flex items-center gap-2 bg-gradient-to-tr from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-md shadow-emerald-950/20 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
                          >
                            <Download className="w-4 h-4" />
                            Exportar CSV
                          </button>
                        </div>
                      </div>

                      {/* Leads table */}
                      <div className="overflow-x-auto border border-slate-800/80 rounded-xl flex-grow bg-slate-950/20">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-900/40 text-slate-350 border-b border-slate-800/80 font-semibold">
                              <th className="p-4 w-10 text-center">
                                <input
                                  type="checkbox"
                                  className="rounded border-slate-800 bg-slate-950/50 text-indigo-600 focus:ring-indigo-500/50 cursor-pointer w-4 h-4"
                                  checked={filteredResults.length > 0 && filteredResults.every(item => selectedLeads.includes(results.indexOf(item)))}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      const currentFilteredIndices = filteredResults.map(item => results.indexOf(item));
                                      setSelectedLeads(prev => Array.from(new Set([...prev, ...currentFilteredIndices])));
                                    } else {
                                      const currentFilteredIndices = filteredResults.map(item => results.indexOf(item));
                                      setSelectedLeads(prev => prev.filter(idx => !currentFilteredIndices.includes(idx)));
                                    }
                                  }}
                                />
                              </th>
                              <th className="p-4">Nome do Local</th>
                              <th className="p-4">Endereço</th>
                              <th className="p-4">Telefone</th>
                              <th className="p-4">Categoria</th>
                              <th className="p-4 text-center">Website</th>
                              <th className="p-4 text-center">Ações</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-850/60">
                            {filteredResults.length > 0 ? (
                              filteredResults.map((place, idx) => (
                                <tr 
                                  key={idx} 
                                  onClick={() => setSelectedPlace(place)}
                                  className="hover:bg-slate-800/30 text-slate-305 transition-colors cursor-pointer"
                                >
                                  <td className="p-4 w-10 text-center" onClick={(e) => e.stopPropagation()}>
                                    <input
                                      type="checkbox"
                                      className="rounded border-slate-800 bg-slate-950/50 text-indigo-600 focus:ring-indigo-500/50 cursor-pointer w-4 h-4"
                                      checked={selectedLeads.includes(results.indexOf(place))}
                                      onChange={(e) => {
                                        const leadIdx = results.indexOf(place);
                                        if (e.target.checked) {
                                          setSelectedLeads(prev => [...prev, leadIdx]);
                                        } else {
                                          setSelectedLeads(prev => prev.filter(idx => idx !== leadIdx));
                                        }
                                      }}
                                    />
                                  </td>
                                  <td className="p-4 font-semibold text-white max-w-[150px] truncate">
                                    {place.title}
                                  </td>
                                  <td className="p-4 max-w-[200px] truncate text-slate-400">
                                    {place.address}
                                  </td>
                                  <td className="p-4 text-slate-200 font-mono">
                                    <div className="flex items-center gap-1.5">
                                      <span>{place.phone}</span>
                                      {dispatchStatus[results.indexOf(place)] && (
                                        <span className="text-[11px]" title={`Status: ${dispatchStatus[results.indexOf(place)]}`}>
                                          {dispatchStatus[results.indexOf(place)] === 'pending' && '⏳'}
                                          {dispatchStatus[results.indexOf(place)] === 'sending' && '🔄'}
                                          {dispatchStatus[results.indexOf(place)] === 'sent' && '✅'}
                                          {dispatchStatus[results.indexOf(place)] === 'error' && '❌'}
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="p-4">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-indigo-300 border border-slate-700/50">
                                      {place.categoryName}
                                    </span>
                                  </td>
                                  <td className="p-4 max-w-[150px] truncate text-slate-400 text-center">
                                    {place.website && place.website !== 'Sem Website' ? (
                                      <a 
                                        href={place.website.startsWith('http') ? place.website : `http://${place.website}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-blue-400 hover:underline inline-flex items-center gap-1 justify-center"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        {place.website}
                                        <ExternalLink className="w-3 h-3" />
                                      </a>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                        Sem Site
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                                    <a
                                      href={`https://wa.me/${getCleanPhone(place.phone)}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="px-2.5 py-1 bg-green-600/15 border border-green-500/30 text-green-400 hover:bg-green-600 hover:text-white rounded-lg text-[10px] font-semibold transition-all inline-flex items-center gap-1 cursor-pointer"
                                      title="Enviar mensagem individual"
                                    >
                                      📱 WhatsApp
                                    </a>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="7" className="p-8 text-center text-slate-500">
                                  Nenhum resultado corresponde ao filtro "{filterText}"
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Bulk Dispatch Panel */}
                      {selectedLeads.length > 0 && (
                        <div className="p-4 mt-6 bg-slate-950/40 border border-indigo-500/20 rounded-2xl animate-fade-in space-y-4">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div>
                              <h4 className="text-white text-xs font-bold flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-indigo-400" />
                                Disparo em Massa para WhatsApp
                              </h4>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {selectedLeads.length} lead(s) selecionado(s) para prospecção.
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setSelectedLeads([])}
                                className="px-3 py-1.5 border border-slate-800 hover:bg-slate-805 text-slate-400 hover:text-white rounded-lg text-[10px] font-semibold transition-all cursor-pointer"
                                disabled={dispatching}
                              >
                                Limpar Seleção
                              </button>
                              <button
                                onClick={handleBulkDispatch}
                                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-semibold transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                                disabled={dispatching}
                              >
                                {dispatching ? (
                                  <>
                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                    Disparando...
                                  </>
                                ) : (
                                  <>
                                    <Send className="w-3 h-3" />
                                    Disparar para Selecionados
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-[10px]">
                              <label className="text-slate-300 font-semibold">Mensagem do Modelo</label>
                              <span className="text-slate-500 font-mono">
                                Variáveis: <code className="text-indigo-300 bg-slate-900 px-1 py-0.5 rounded">{`{nome}`}</code>, <code className="text-indigo-300 bg-slate-900 px-1 py-0.5 rounded">{`{endereco}`}</code>, <code className="text-indigo-300 bg-slate-900 px-1 py-0.5 rounded">{`{telefone}`}</code>
                              </span>
                            </div>
                            <textarea
                              className="w-full p-3 bg-slate-950/50 border border-slate-800 focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/50 rounded-xl text-xs text-white placeholder-slate-650 outline-none transition-all resize-none min-h-[80px]"
                              value={messageTemplate}
                              onChange={(e) => setMessageTemplate(e.target.value)}
                              disabled={dispatching}
                              placeholder="Use as variáveis: {nome}, {endereco}, {telefone}"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col justify-center items-center py-12 text-center">
                      <div className="p-4 bg-slate-950/50 text-slate-650 rounded-2xl border border-slate-800/60 mb-4">
                        <FileSpreadsheet className="w-12 h-12" />
                      </div>
                      <h4 className="text-white text-base font-bold font-display mb-1.5">Nenhum dado a exibir</h4>
                      <p className="text-slate-400 text-xs max-w-sm px-6 leading-relaxed">
                        Insira seus termos de busca e localização no formulário ao lado para iniciar a varredura do Google Places.
                      </p>
                      <div className="mt-6 flex flex-col gap-2 p-4 bg-slate-950/20 border border-slate-850/60 rounded-xl text-left max-w-md">
                        <div className="flex gap-2 items-center text-[10px] text-indigo-400 font-bold tracking-wider uppercase mb-1">
                          <HelpCircle className="w-3.5 h-3.5" />
                          Como Funciona?
                        </div>
                        <p className="text-slate-400 text-[11px] leading-relaxed">
                          Nossa ferramenta realiza uma consulta no robô do Google Places da Apify e filtra automaticamente estabelecimentos que <strong>não possuem website</strong>. Esse é o perfil ideal para prospecção ativa de serviços web!
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Planos */}
        {activeTab === 'plans' && (
          <div className="space-y-8 animate-fade-in pb-12">
            <div className="border-b border-slate-900 pb-5">
              <h2 className="text-2xl font-bold font-display text-white">Nossos Planos</h2>
              <p className="text-slate-400 text-xs mt-1">Escolha a melhor assinatura para escalar suas prospecções de leads</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              {[
                {
                  name: 'Mensal',
                  price: 'R$ 47',
                  period: '/mês',
                  description: 'Ideal para testar a ferramenta e buscar primeiros leads.',
                  features: [
                    'Acesso completo ao Google Places Crawler',
                    'Filtro automático de leads sem website',
                    'Exportação ilimitada para CSV',
                    'Painel de disparos sequenciais'
                  ],
                  recommended: false
                },
                {
                  name: 'Trimestral',
                  price: 'R$ 97',
                  period: '/trimestre',
                  description: 'O melhor custo-benefício para aceleração de prospecção.',
                  features: [
                    'Acesso completo ao Google Places Crawler',
                    'Filtro automático de leads sem website',
                    'Exportação ilimitada para CSV',
                    'Painel de disparos sequenciais',
                    'Desconto equivalente a 30% off'
                  ],
                  recommended: true
                },
                {
                  name: 'Anual',
                  price: 'R$ 197',
                  period: '/ano',
                  description: 'Para agências e equipes que buscam resultados de longo prazo.',
                  features: [
                    'Acesso completo ao Google Places Crawler',
                    'Filtro automático de leads sem website',
                    'Exportação ilimitada para CSV',
                    'Painel de disparos sequenciais',
                    'Desconto equivalente a 65% off'
                  ],
                  recommended: false
                }
              ].map((plan, idx) => (
                <div 
                  key={idx}
                  className={`p-6 rounded-2xl bg-slate-900/60 backdrop-blur-xl border flex flex-col justify-between transition-all relative ${
                    plan.recommended 
                      ? 'border-indigo-500 shadow-lg shadow-indigo-500/10 scale-[1.02]' 
                      : 'border-slate-800/80 shadow-md'
                  }`}
                >
                  {plan.recommended && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-[9px] font-bold text-white rounded-full tracking-wide uppercase shadow">
                      Recomendado
                    </span>
                  )}

                  <div>
                    <h3 className="text-base font-bold text-white">{plan.name}</h3>
                    <p className="text-slate-400 text-xs mt-2 leading-relaxed min-h-[40px]">{plan.description}</p>
                    
                    <div className="my-6 flex items-baseline">
                      <span className="text-3xl font-extrabold text-white">{plan.price}</span>
                      <span className="text-slate-400 text-xs font-semibold ml-1">{plan.period}</span>
                    </div>

                    <ul className="space-y-3 border-t border-slate-800/50 pt-5 text-xs text-slate-300">
                      {plan.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    className={`w-full py-2.5 mt-8 text-xs font-bold rounded-xl transition-all active:scale-[0.98] cursor-pointer ${
                      plan.recommended
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow shadow-blue-500/10'
                        : 'bg-slate-800 hover:bg-slate-750 text-slate-200'
                    }`}
                  >
                    Assinar Plano
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Configurações */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl space-y-8 animate-fade-in">
            <div className="border-b border-slate-900 pb-5">
              <h2 className="text-2xl font-bold font-display text-white">Configurações</h2>
              <p className="text-slate-400 text-xs mt-1">Gerencie suas chaves de API e status da conta</p>
            </div>

            {/* Plan Status Card */}
            <div className="p-6 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-xl space-y-5">
              <h3 className="text-sm font-bold font-display text-white flex items-center gap-2 border-b border-slate-850 pb-3">
                <CreditCard className="w-4 h-4 text-indigo-400" />
                Status do Plano
              </h3>

              {planInfo.daysRemaining <= 0 ? (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-start gap-3 text-xs font-medium">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <div>
                    <span className="font-bold block">Plano vencido</span>
                    <span className="mt-1 block leading-relaxed">Renove seu plano para continuar acessando todos os recursos da plataforma de leads.</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 text-indigo-300 rounded-xl flex items-start gap-3 text-xs leading-relaxed">
                  <CheckCircle className="w-5 h-5 text-indigo-450 shrink-0" />
                  <div>
                    Seu plano está ativo e funcionando normalmente. Aproveite suas buscas!
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 bg-slate-950/50 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block">Plano Atual</span>
                  <span className="text-white font-bold block mt-1 text-sm">{planInfo.name}</span>
                </div>

                <div className="p-3.5 bg-slate-950/50 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block">Vencimento</span>
                  <span className="text-white font-bold block mt-1 text-sm">
                    {new Date(planInfo.expirationDate).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-950/50 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block">Tempo Restante</span>
                  <span className={`font-bold block mt-1 text-sm ${planInfo.daysRemaining <= 0 ? 'text-red-450' : 'text-white'}`}>
                    {planInfo.daysRemaining <= 0 ? 'Expirado' : `${planInfo.daysRemaining} dias`}
                  </span>
                </div>
              </div>
            </div>

            {/* Apify API Key Card */}
            <div className="p-6 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-xl space-y-5">
              <h3 className="text-sm font-bold font-display text-white flex items-center gap-2 border-b border-slate-850 pb-3">
                <Key className="w-4 h-4 text-blue-400" />
                API Apify
              </h3>
              
              <p className="text-[11px] text-slate-400 leading-relaxed">
                A ferramenta utiliza o motor do Apify para buscar dados do Google Places. Insira sua chave de API pessoal abaixo para executar os crawlers em sua conta.
              </p>

              <form onSubmit={handleSaveApiKey} className="space-y-4">
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1.5">
                    Apify API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      className="w-full pl-3 pr-10 py-2.5 bg-slate-950/50 border border-slate-800 focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 rounded-xl text-xs text-white placeholder-slate-600 outline-none transition-all"
                      placeholder="apify_api_XXXXXX..."
                      value={apiKey}
                      onChange={(e) => {
                        setApiKey(e.target.value);
                        setApiKeySaved(false);
                      }}
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-350"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    id="save-key-btn"
                    className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-blue-950/20 cursor-pointer"
                  >
                    Salvar Chave
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Place Detail Modal */}
      {selectedPlace && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-850 rounded-2xl p-6 shadow-2xl animate-scale-up">
            <h3 className="text-lg font-bold font-display text-white mb-2">{selectedPlace.title}</h3>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-indigo-300 border border-slate-700/50 mb-5">
              {selectedPlace.categoryName}
            </span>

            <div className="space-y-4">
              <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-850/60">
                <span className="text-slate-400 text-[10px] font-mono block mb-1">Endereço Completo</span>
                <span className="text-slate-200 text-xs font-medium leading-relaxed">{selectedPlace.address}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-850/60">
                  <span className="text-slate-400 text-[10px] font-mono block mb-1">Telefone</span>
                  <span className="text-slate-200 text-xs font-mono font-bold">{selectedPlace.phone}</span>
                </div>
                <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-850/60">
                  <span className="text-slate-400 text-[10px] font-mono block mb-1">Status de Website</span>
                  {selectedPlace.website && selectedPlace.website !== 'Sem Website' ? (
                    <a 
                      href={selectedPlace.website.startsWith('http') ? selectedPlace.website : `http://${selectedPlace.website}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 text-xs font-bold hover:underline inline-flex items-center gap-1"
                    >
                      {selectedPlace.website}
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="text-amber-400 text-xs font-bold">
                      Sem Site
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 text-indigo-300 rounded-xl text-xs leading-relaxed">
                <strong>Oportunidade Comercial:</strong> Este estabelecimento não possui site mapeado no Google Maps. Há uma excelente oportunidade para oferecer serviços de criação de páginas web, landing pages ou SEO local.
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-slate-850 pt-4">
              <button
                onClick={() => setSelectedPlace(null)}
                className="px-4 py-2 border border-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                Fechar
              </button>
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(selectedPlace.title + ' ' + selectedPlace.address)}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-950/20"
              >
                Ver no Google
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
