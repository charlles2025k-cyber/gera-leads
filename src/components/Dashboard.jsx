import React, { useState, useEffect, useMemo } from 'react';
import { 
  Key, Eye, EyeOff, Search, Download, LogOut, ShieldCheck, 
  MapPin, Sliders, Database, AlertCircle, FileSpreadsheet,
  CheckCircle, RefreshCw, Layers, ExternalLink, HelpCircle,
  Settings, MessageSquare, Send, CreditCard, BarChart3, Clock, User,
  Lock, BookOpen, Users, XCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, PieChart, Pie, Cell 
} from 'recharts';

export default function Dashboard({ user, onLogout, showAlert }) {
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
  const [currentPage, setCurrentPage] = useState(1);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterText]);

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

  // User Profile from Supabase
  const [profile, setProfile] = useState({
    plan: 'free',
    plan_expires_at: null,
    plan_type: null
  });
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Lead Usage Tracking State
  const [usageTracking, setUsageTracking] = useState({
    leads_used: 0,
    period_start: null
  });

  // ZapFlow License States
  const [zapflowLicense, setZapflowLicense] = useState(null);
  const [loadingLicense, setLoadingLicense] = useState(true);
  const [copiedKey, setCopiedKey] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);

  // Modal Lock State
  const [lockModal, setLockModal] = useState({
    isOpen: false,
    title: '',
    message: ''
  });

  // WhatsApp Groups States
  const [groupNiche, setGroupNiche] = useState('barbearia');
  const [groupCity, setGroupCity] = useState('Fortaleza');
  const [groupPlatform, setGroupPlatform] = useState('facebook.com');
  const [searchingGroups, setSearchingGroups] = useState(false);
  const [groupResults, setGroupResults] = useState([]);
  const [groupError, setGroupError] = useState('');
  const [groupLimit, setGroupLimit] = useState(10);

  // Calculate ZapFlow 7-day guarantee lock remaining time
  useEffect(() => {
    if (!zapflowLicense || !zapflowLicense.created_at) {
      setTimeRemaining(null);
      return;
    }

    const calculateTimeRemaining = () => {
      const createdTime = new Date(zapflowLicense.created_at).getTime();
      const targetTime = createdTime + 7 * 24 * 60 * 60 * 1000;
      const now = new Date().getTime();
      const diff = targetTime - now;

      if (diff <= 0) {
        setTimeRemaining(null);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeRemaining({
        days,
        hours,
        minutes,
        seconds,
        totalMs: diff
      });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [zapflowLicense]);

  // Load API key, profile, usage and history on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('apify_api_key') || '';
    setApiKey(savedKey);
    if (savedKey) {
      setApiKeySaved(true);
    }

    const initAuthAndData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        fetchUserProfile();
        fetchUsageTracking();
        fetchSearchHistory();
        fetchZapflowLicense();
      }
    };

    initAuthAndData();

    // Subscribe to auth state changes to reload when user signs in
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        fetchUserProfile();
        fetchUsageTracking();
        fetchSearchHistory();
        fetchZapflowLicense();
      }
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Fetch user profile from Supabase profiles table
  const fetchUserProfile = async () => {
    setLoadingProfile(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, plan, plan_expires_at, plan_type, name')
          .eq('id', session.user.id)
          .maybeSingle();

        if (error) throw error;
        
        if (data) {
          setProfile(data);
        } else {
          setProfile({
            plan: 'free',
            plan_expires_at: null,
            plan_type: null
          });
        }
      }
    } catch (err) {
      console.error("Erro ao carregar perfil do Supabase:", err);
      setProfile({
        plan: 'free',
        plan_expires_at: null,
        plan_type: null
      });
    } finally {
      setLoadingProfile(false);
    }
  };

  // Fetch usage tracking details from Supabase
  const fetchUsageTracking = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data, error } = await supabase
          .from('usage_tracking')
          .select('leads_used, period_start')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setUsageTracking(data);
        } else {
          setUsageTracking({ leads_used: 0, period_start: null });
        }
      }
    } catch (err) {
      console.error("Erro ao carregar tracking de uso do Supabase:", err);
    }
  };

  // Fetch ZapFlow license details from Supabase
  const fetchZapflowLicense = async () => {
    setLoadingLicense(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data, error } = await supabase
          .from('zapflow_licenses')
          .select('license_key, disparos_usados, disparos_limite, plan_type, created_at')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (error) throw error;
        setZapflowLicense(data || null);
      }
    } catch (err) {
      console.error("Erro ao carregar licença ZapFlow:", err);
      setZapflowLicense(null);
    } finally {
      setLoadingLicense(false);
    }
  };

  const handleCopyLicenseKey = (key) => {
    if (!key) return;
    console.log("Copiando chave da licença ZapFlow:", key);
    navigator.clipboard.writeText(key).then(() => {
      setCopiedKey(true);
      if (showAlert) showAlert("Chave da licença copiada para a área de transferência!", "success");
      setTimeout(() => setCopiedKey(false), 2000);
    }).catch(() => {
      // fallback for older browsers
      const el = document.createElement('textarea');
      el.value = key;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopiedKey(true);
      if (showAlert) showAlert("Chave da licença copiada para a área de transferência!", "success");
      setTimeout(() => setCopiedKey(false), 2000);
    });
  };

  // Calculate days remaining and expired status
  const daysRemaining = useMemo(() => {
    if (!profile || profile.plan === 'free' || !profile.plan_expires_at) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiration = new Date(profile.plan_expires_at);
    expiration.setHours(0, 0, 0, 0);
    const diffTime = expiration - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [profile]);

  const isExpired = useMemo(() => {
    if (!profile || profile.plan === 'free') return false;
    return daysRemaining !== null && daysRemaining <= 0;
  }, [profile, daysRemaining]);

  // Compute plan limit based on plan column
  const planLimit = useMemo(() => {
    const plan = (profile?.plan || 'free').trim();
    if (plan === 'monthly') return 500;
    if (plan === 'quarterly') return 1500;
    if (plan === 'annual') return 5000;
    return 0;
  }, [profile]);

  // Translate plan codes to user-friendly Portuguese names
  const planNamePt = useMemo(() => {
    const plan = (profile?.plan || 'free').trim();
    if (plan === 'monthly') return 'Mensal';
    if (plan === 'quarterly') return 'Trimestral';
    if (plan === 'annual') return 'Anual';
    return 'Gratuito';
  }, [profile]);

  const userPlan = useMemo(() => (profile?.plan || 'free').trim(), [profile]);

  const leadsRemaining = useMemo(() => {
    const limit = planLimit;
    const used = usageTracking.leads_used || 0;
    const remaining = Math.max(0, limit - used);
    return `${remaining}/${limit} leads restantes`;
  }, [planLimit, usageTracking]);

  // Compute progress percent for limit bar
  const progressPercent = useMemo(() => {
    if (planLimit === Infinity || planLimit === 0) return 0;
    return ((usageTracking.leads_used || 0) / planLimit) * 100;
  }, [usageTracking, planLimit]);

  // Determine progress bar and text styling based on thresholds (80% and 100%)
  const { progressBarColor, progressTextColor } = useMemo(() => {
    const used = usageTracking.leads_used || 0;
    if (planLimit === Infinity) return { progressBarColor: 'bg-indigo-500', progressTextColor: 'text-indigo-400' };
    if (used >= planLimit) return { progressBarColor: 'bg-red-500', progressTextColor: 'text-red-400' };
    if (used >= planLimit * 0.8) return { progressBarColor: 'bg-amber-500', progressTextColor: 'text-amber-400' };
    return { progressBarColor: 'bg-indigo-500', progressTextColor: 'text-indigo-400' };
  }, [usageTracking, planLimit]);

  const zapflowPercent = useMemo(() => {
    if (!zapflowLicense || !zapflowLicense.disparos_limite) return 0;
    return ((zapflowLicense.disparos_usados || 0) / zapflowLicense.disparos_limite) * 100;
  }, [zapflowLicense]);

  const zapflowProgressBarColor = useMemo(() => {
    if (!zapflowLicense) return 'bg-indigo-500';
    const used = zapflowLicense.disparos_usados || 0;
    const limit = zapflowLicense.disparos_limite;
    if (used >= limit) return 'bg-red-500';
    if (used >= limit * 0.8) return 'bg-amber-500';
    return 'bg-indigo-500';
  }, [zapflowLicense]);

  const zapflowUserName = useMemo(() => {
    if (profile && profile.name) return profile.name;
    if (user && user.name) {
      if (user.name.includes('@')) {
        return user.name.split('@')[0];
      }
      return user.name;
    }
    if (user && user.email) {
      return user.email.split('@')[0];
    }
    return 'Usuário';
  }, [profile, user]);

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
    if (showAlert) showAlert("Chave API do Apify salva com sucesso!", "success");
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
      const errorMsg = 'Por favor, configure e salve sua API Key do Apify para enviar mensagens.';
      setError(errorMsg);
      if (showAlert) showAlert(errorMsg, 'warning');
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

  // WhatsApp Groups Search Function
  const handleGroupSearch = async (e) => {
    e.preventDefault();
    setGroupError('');
    setGroupResults([]);
    setSearchingGroups(true);

    if (!apiKey) {
      const errorMsg = 'Por favor, configure e salve sua API Key do Apify para realizar buscas.';
      setGroupError(errorMsg);
      if (showAlert) showAlert(errorMsg, 'warning');
      setSearchingGroups(false);
      return;
    }

    if (!groupNiche.trim()) {
      const errorMsg = 'Por favor, informe o nicho para a busca.';
      setGroupError(errorMsg);
      if (showAlert) showAlert(errorMsg, 'warning');
      setSearchingGroups(false);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Usuário não autenticado. Por favor, faça login novamente.');
      }
      const userId = session.user.id;

      // 1. Get the user's current usage tracking status from Supabase
      let { data: usage, error: usageErr } = await supabase
        .from('usage_tracking')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (usageErr) throw usageErr;

      const now = new Date();

      if (!usage) {
        // Create new usage record if none exists
        const { data: newUsage, error: insertErr } = await supabase
          .from('usage_tracking')
          .insert({
            user_id: userId,
            leads_used: 0,
            period_start: now.toISOString(),
            created_at: now.toISOString()
          })
          .select()
          .single();

        if (insertErr) throw insertErr;
        usage = newUsage;
      } else {
        // Reset logic: check if period_start is older than 30 days
        const periodStart = new Date(usage.period_start);
        const diffTime = Math.abs(now - periodStart);
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        if (diffDays >= 30) {
          const { data: resetUsage, error: updateErr } = await supabase
            .from('usage_tracking')
            .update({
              leads_used: 0,
              period_start: now.toISOString()
            })
            .eq('id', usage.id)
            .select()
            .single();

          if (updateErr) throw updateErr;
          usage = resetUsage;
        }
      }

      const currentLeadsUsed = usage.leads_used || 0;
      const remainingLeads = planLimit - currentLeadsUsed;

      if (remainingLeads < groupLimit) {
        const errorMsg = "Você não tem leads suficientes. Reduza o limite ou faça upgrade.";
        setGroupError(errorMsg);
        if (showAlert) showAlert(errorMsg, 'warning');
        setSearchingGroups(false);
        return;
      }

      const cleanNiche = groupNiche.trim();
      const cleanCity = groupCity.trim();
      const queryParts = [];
      queryParts.push(`"${cleanNiche}"`);
      if (cleanCity) {
        queryParts.push(`"${cleanCity}"`);
      }
      queryParts.push('"chat.whatsapp.com"');
      queryParts.push(`site:${groupPlatform}`);
      
      const queryStr = queryParts.join(' ');

      const response = await fetch(
        `https://api.apify.com/v2/acts/apify~google-search-scraper/run-sync-get-dataset-items?token=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            queries: queryStr,
            maxPagesPerQuery: 1,
            resultsPerPage: groupLimit,
            countryCode: "br",
            languageCode: "pt-BR"
          })
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Falha na API do Apify (${response.status}): ${errText || response.statusText}`);
      }

      const data = await response.json();
      
      if (Array.isArray(data)) {
        const parsed = [];
        const regex = /chat\.whatsapp\.com\/[a-zA-Z0-9\-_]{22}/i;

        data.forEach(page => {
          if (page.organicResults && Array.isArray(page.organicResults)) {
            page.organicResults.forEach(item => {
              let groupLink = null;
              if (item.url && item.url.includes('chat.whatsapp.com')) {
                groupLink = item.url;
              } else {
                const match = (item.description || '').match(regex) || 
                              (item.title || '').match(regex) || 
                              (item.url || '').match(regex);
                if (match) {
                  groupLink = `https://${match[0]}`;
                }
              }

              if (groupLink) {
                parsed.push({
                  groupLink,
                  sourceUrl: item.url || item.displayedUrl || '',
                  title: item.title || 'Sem título',
                  description: item.description || ''
                });
              }
            });
          }
        });

        const uniqueParsed = [];
        const seenLinks = new Set();
        parsed.forEach(item => {
          if (!seenLinks.has(item.groupLink)) {
            seenLinks.add(item.groupLink);
            uniqueParsed.push(item);
          }
        });

        setGroupResults(uniqueParsed);

        // Increment leads_used by the number of unique group results returned
        const newLeadsUsed = currentLeadsUsed + uniqueParsed.length;
        const { error: incrementErr } = await supabase
          .from('usage_tracking')
          .update({ leads_used: newLeadsUsed })
          .eq('id', usage.id);

        if (incrementErr) {
          console.error("Erro ao atualizar o uso de leads:", incrementErr);
        } else {
          setUsageTracking(prev => ({
            ...prev,
            leads_used: newLeadsUsed
          }));
        }

        if (showAlert) showAlert(`Busca concluída! Encontramos ${uniqueParsed.length} grupos de WhatsApp.`, 'success');
      } else {
        throw new Error('Formato de dados retornado inválido. Esperava-se uma lista.');
      }
    } catch (err) {
      console.error(err);
      setGroupError(`Erro ao buscar grupos no Apify: ${err.message}`);
      if (showAlert) showAlert(`Erro ao buscar grupos: ${err.message}`, 'error');
    } finally {
      setSearchingGroups(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setResults([]);
    setSelectedLeads([]);
    setDispatchStatus({});
    setCurrentPage(1);

    if (!apiKey) {
      const errorMsg = 'Por favor, configure e salve sua API Key do Apify para realizar buscas reais.';
      setError(errorMsg);
      if (showAlert) showAlert(errorMsg, 'warning');
      return;
    }

    if (!searchQuery.trim()) {
      const errorMsg = 'Por favor, informe o termo de pesquisa (o que buscar).';
      setError(errorMsg);
      if (showAlert) showAlert(errorMsg, 'warning');
      return;
    }

    if (!locationQuery.trim()) {
      const errorMsg = 'Por favor, informe a cidade/estado para a busca.';
      setError(errorMsg);
      if (showAlert) showAlert(errorMsg, 'warning');
      return;
    }

    const maxCount = Math.min(100, Math.max(1, parseInt(maxPlaces) || 10));

    setLoading(true);
    setProgressMsg('Verificando limites de uso do plano...');
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Usuário não autenticado. Por favor, faça login novamente.');
      }
      const userId = session.user.id;

      // 1. Get the user's plan from profiles
      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', userId)
        .maybeSingle();

      if (profileErr) throw profileErr;
      const plan = (profileData?.plan || 'free').trim();

      // Determine the limit based on plan
      let planLimit = 0;
      if (plan === 'monthly') planLimit = 500;
      else if (plan === 'quarterly') planLimit = 1500;
      else if (plan === 'annual') planLimit = 5000;

      // 2. Get the user's current usage tracking status
      let { data: usage, error: usageErr } = await supabase
        .from('usage_tracking')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (usageErr) throw usageErr;

      const now = new Date();

      if (!usage) {
        // Create new usage record if none exists
        const { data: newUsage, error: insertErr } = await supabase
          .from('usage_tracking')
          .insert({
            user_id: userId,
            leads_used: 0,
            period_start: now.toISOString(),
            created_at: now.toISOString()
          })
          .select()
          .single();

        if (insertErr) throw insertErr;
        usage = newUsage;
      } else {
        // Reset logic: check if period_start is older than 30 days
        const periodStart = new Date(usage.period_start);
        const diffTime = Math.abs(now - periodStart);
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        if (diffDays >= 30) {
          const { data: resetUsage, error: updateErr } = await supabase
            .from('usage_tracking')
            .update({
              leads_used: 0,
              period_start: now.toISOString()
            })
            .eq('id', usage.id)
            .select()
            .single();

          if (updateErr) throw updateErr;
          usage = resetUsage;
        }
      }

      const currentLeadsUsed = usage.leads_used || 0;
      const requestedAmount = maxCount;

      // 3. Check if current usage + requested amount exceeds the limit
      if (planLimit !== Infinity && (currentLeadsUsed + requestedAmount) > planLimit) {
        setError('Você atingiu o limite do seu plano. Faça upgrade para continuar buscando leads.');
        setLoading(false);
        return;
      }

      // Proceed with the search
      setProgressMsg('Enviando requisição síncrona para o Apify (isso pode levar até 2 minutos)...');

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

        // 4. Increment leads_used by the number of results returned
        const newLeadsUsed = currentLeadsUsed + normalized.length;
        const { error: incrementErr } = await supabase
          .from('usage_tracking')
          .update({ leads_used: newLeadsUsed })
          .eq('id', usage.id);

        if (incrementErr) {
          console.error("Erro ao atualizar o uso de leads:", incrementErr);
        } else {
          setUsageTracking(prev => ({
            ...prev,
            leads_used: newLeadsUsed
          }));
        }

        // Save to Supabase searches log
        try {
          await supabase.from('lead_searches').insert({
            user_id: userId,
            search_term: searchQuery.trim(),
            location: locationQuery.trim(),
            total_results: normalized.length
          });
          fetchSearchHistory();
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
    if (showAlert) showAlert("Lista de leads exportada para CSV com sucesso!", "success");
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

  // Pagination calculations
  const indexOfLastLead = currentPage * 10;
  const indexOfFirstLead = indexOfLastLead - 10;
  const currentLeads = filteredResults.slice(indexOfFirstLead, indexOfLastLead);
  const totalPages = Math.ceil(filteredResults.length / 10);
  const showingFrom = filteredResults.length === 0 ? 0 : indexOfFirstLead + 1;
  const showingTo = Math.min(indexOfLastLead, filteredResults.length);

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
          <div className="flex flex-col items-center justify-center text-center gap-2 mb-6">
            <img 
              src="/favicon.svg" 
              alt="Gera Leads" 
              className="w-12 h-12 rounded-xl shadow-lg shadow-indigo-500/10 border border-slate-800" 
            />
            <div>
              <h1 className="text-base font-bold font-display text-white tracking-tight">
                Gera Leads
              </h1>
              <span className="text-[10px] text-slate-500 block mt-0.5">Prospectador de Leads</span>
            </div>
          </div>

          {/* User Profile Highlighted Card */}
          <div className="p-3.5 bg-slate-800/30 border border-slate-750 rounded-xl shadow-md flex flex-col gap-1.5">
            <div className="text-[11px] font-semibold text-slate-200 truncate leading-snug" title={user.name}>
              {user.name}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
              <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/15">
                {planNamePt}
              </span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-300 font-mono">
                {leadsRemaining}
              </span>
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
              onClick={() => setActiveTab('whatsapp_groups')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all border border-transparent cursor-pointer ${
                activeTab === 'whatsapp_groups'
                  ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/20 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850/30'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Grupos WhatsApp
            </button>
            <button
              onClick={() => {
                if (userPlan === 'monthly' || userPlan === 'quarterly' || userPlan === 'annual') {
                  setActiveTab('course');
                } else {
                  setLockModal({
                    isOpen: true,
                    title: 'Curso Bloqueado',
                    message: 'Faça upgrade do seu plano para acessar o Curso.'
                  });
                }
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all border border-transparent cursor-pointer ${
                activeTab === 'course'
                  ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/20 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4" />
                Curso
              </div>
              {userPlan !== 'monthly' && userPlan !== 'quarterly' && userPlan !== 'annual' && (
                <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              )}
            </button>
            <button
              onClick={() => {
                if (userPlan === 'annual') {
                  setActiveTab('vip');
                } else {
                  setLockModal({
                    isOpen: true,
                    title: 'Grupo VIP Bloqueado',
                    message: 'Faça upgrade do seu plano para acessar o Grupo VIP.'
                  });
                }
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all border border-transparent cursor-pointer ${
                activeTab === 'vip'
                  ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/20 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" />
                Grupo VIP
              </div>
              {userPlan !== 'annual' && (
                <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              )}
            </button>

            <button
              onClick={() => {
                if (userPlan === 'quarterly' || userPlan === 'annual') {
                  if (!timeRemaining) {
                    window.open('https://t.me/+GCtked4jQ0ZmYWYx', '_blank');
                  }
                } else {
                  setLockModal({
                    isOpen: true,
                    title: 'Canal do Telegram Bloqueado',
                    message: 'Faça upgrade do seu plano para acessar o canal do Telegram.'
                  });
                }
              }}
              disabled={!!timeRemaining && (userPlan === 'quarterly' || userPlan === 'annual')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all border border-transparent ${
                timeRemaining && (userPlan === 'quarterly' || userPlan === 'annual')
                  ? 'opacity-50 cursor-not-allowed text-slate-500'
                  : 'cursor-pointer text-slate-400 hover:text-white hover:bg-slate-850/30'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Send className="w-4 h-4 shrink-0" />
                <span className="truncate">Telegram</span>
              </div>
              {userPlan !== 'quarterly' && userPlan !== 'annual' ? (
                <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              ) : (
                timeRemaining && (
                  <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded-md shrink-0">
                    {timeRemaining.days}d {String(timeRemaining.hours).padStart(2, '0')}:{String(timeRemaining.minutes).padStart(2, '0')}
                  </span>
                )
              )}
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0a0f1b]/95 border-t border-slate-850 backdrop-blur-lg flex items-center justify-around z-40 px-1 gap-1">
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
          onClick={() => setActiveTab('whatsapp_groups')}
          className={`flex flex-col items-center gap-1 text-[9px] font-semibold transition-colors cursor-pointer ${
            activeTab === 'whatsapp_groups' ? 'text-indigo-400 font-bold' : 'text-slate-500'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Grupos
        </button>
        <button
          onClick={() => {
            if (userPlan === 'monthly' || userPlan === 'quarterly' || userPlan === 'annual') {
              setActiveTab('course');
            } else {
              setLockModal({
                isOpen: true,
                title: 'Curso Bloqueado',
                message: 'Faça upgrade do seu plano para acessar o Curso.'
              });
            }
          }}
          className={`flex flex-col items-center gap-1 text-[9px] font-semibold transition-colors cursor-pointer relative ${
            activeTab === 'course' ? 'text-indigo-400 font-bold' : 'text-slate-500'
          }`}
        >
          <div className="relative">
            <BookOpen className="w-4 h-4" />
            {userPlan !== 'monthly' && userPlan !== 'quarterly' && userPlan !== 'annual' && (
              <Lock className="w-2.5 h-2.5 text-slate-500 absolute -top-1.5 -right-1.5 bg-[#0a0f1b] rounded-full p-0.5" />
            )}
          </div>
          Curso
        </button>
        <button
          onClick={() => {
            if (userPlan === 'annual') {
              setActiveTab('vip');
            } else {
              setLockModal({
                isOpen: true,
                title: 'Grupo VIP Bloqueado',
                message: 'Faça upgrade do seu plano para acessar o Grupo VIP.'
              });
            }
          }}
          className={`flex flex-col items-center gap-1 text-[9px] font-semibold transition-colors cursor-pointer relative ${
            activeTab === 'vip' ? 'text-indigo-400 font-bold' : 'text-slate-500'
          }`}
        >
          <div className="relative">
            <Users className="w-4 h-4" />
            {userPlan !== 'annual' && (
              <Lock className="w-2.5 h-2.5 text-slate-500 absolute -top-1.5 -right-1.5 bg-[#0a0f1b] rounded-full p-0.5" />
            )}
          </div>
          VIP
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
                onClick={() => {
                  fetchSearchHistory();
                  fetchZapflowLicense();
                }}
                className="p-2 border border-slate-800 hover:border-slate-700 hover:bg-slate-850/30 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                disabled={loadingHistory}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingHistory ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

              <div className="p-6 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-xl flex items-start gap-4">
                <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div className="flex-grow min-w-0">
                  <span className="text-slate-405 text-xs block font-medium">{zapflowUserName}</span>
                  {loadingLicense ? (
                    <span className="text-slate-500 text-xs block mt-1.5 animate-pulse">Carregando...</span>
                  ) : !zapflowLicense ? (
                    <span className="text-amber-400 text-xs font-semibold block mt-1.5">Nenhum plano ativo</span>
                  ) : (
                    <div className="mt-1.5 space-y-3">
                      {timeRemaining && (
                        <div className="text-[9px] font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-md inline-flex items-center gap-1 animate-pulse w-full justify-center">
                          Liberação total em {timeRemaining.days} dias {String(timeRemaining.hours).padStart(2, '0')}:{String(timeRemaining.minutes).padStart(2, '0')}:{String(timeRemaining.seconds).padStart(2, '0')}
                        </div>
                      )}
                      <div className="flex items-center justify-between gap-2">
                        <span 
                          className="text-xs font-mono text-slate-200 truncate" 
                          title={timeRemaining ? 'Chave bloqueada durante o período de garantia' : zapflowLicense.license_key}
                          style={timeRemaining ? { filter: 'blur(6px)', userSelect: 'none' } : {}}
                        >
                          {zapflowLicense.license_key}
                        </span>
                        <button
                          onClick={() => handleCopyLicenseKey(zapflowLicense.license_key)}
                          disabled={!!timeRemaining}
                          className={`px-2 py-0.5 rounded border text-[10px] font-semibold transition-all whitespace-nowrap ${
                            timeRemaining
                              ? 'bg-slate-900 border-slate-800 text-slate-650 cursor-not-allowed opacity-50'
                              : 'bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-750 cursor-pointer'
                          }`}
                        >
                          {copiedKey ? 'Copiado!' : 'Copiar'}
                        </button>
                      </div>
                      
                      <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-450 font-medium">Licença</span>
                          <span className="font-mono text-slate-355 font-bold">
                            {zapflowLicense.disparos_usados || 0} / {zapflowLicense.disparos_limite}
                          </span>
                        </div>
                        <div className="w-full bg-slate-950/50 rounded-full h-2.5 border border-slate-850 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${zapflowProgressBarColor}`}
                            style={{ width: `${Math.min(100, zapflowPercent)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
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

        {/* Tab: Curso */}
        {activeTab === 'course' && (userPlan === 'monthly' || userPlan === 'quarterly' || userPlan === 'annual') && (
          <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
            <div className="border-b border-slate-900 pb-5">
              <h2 className="text-2xl font-bold font-display text-white">Curso Renda Extra</h2>
              <p className="text-slate-400 text-xs mt-1">Aprenda a prospectar e vender para leads sem site</p>
            </div>
            <div className="p-6 md:p-8 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-xl space-y-6">
              <div className="border-b border-slate-800/60 pb-4">
                <h3 className="text-lg font-bold font-display text-white">Curso Completo de Renda Extra</h3>
                <p className="text-slate-400 text-xs mt-1">Aprenda a gerar renda extra com prospecção de clientes.</p>
              </div>
              <div className="w-full aspect-video rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src="https://www.youtube.com/embed/3Tfd9RZQqxo?si=Hxna654PM11qmHiD" 
                  title="YouTube video player" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  referrerPolicy="strict-origin-when-cross-origin" 
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
            </div>
          </div>

          {/* Extensão ZapFlow Download Card */}
            <div className="p-6 md:p-8 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-xl space-y-6">
              <div className="border-b border-slate-800/60 pb-4">
                <h3 className="text-lg font-bold font-display text-white">Baixar Extensão ZapFlow</h3>
                <p className="text-slate-400 text-xs mt-1">Baixe a extensão oficial para realizar envios integrados em massa.</p>
              </div>
              
              {userPlan !== 'quarterly' && userPlan !== 'annual' ? (
                <div className="p-4 bg-slate-950/50 border border-slate-850/60 text-slate-400 rounded-xl text-xs flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>A extensão ZapFlow está disponível apenas para os planos Trimestral e Anual.</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('plans')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all active:scale-[0.98] cursor-pointer"
                  >
                    Fazer Upgrade
                  </button>
                </div>
              ) : timeRemaining ? (
                <div className="p-4 bg-red-500/5 border border-red-500/10 text-red-400 rounded-xl text-xs flex flex-col sm:flex-row justify-between items-center gap-4 animate-pulse">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-red-400 shrink-0" />
                    <span>O download da extensão estará disponível após o período de garantia.</span>
                  </div>
                  <span className="font-mono font-bold whitespace-nowrap">
                    Liberação em {timeRemaining.days}d {String(timeRemaining.hours).padStart(2, '0')}:{String(timeRemaining.minutes).padStart(2, '0')}:{String(timeRemaining.seconds).padStart(2, '0')}
                  </span>
                </div>
              ) : (
                <div>
                  <a
                    href="https://chrome.google.com/webstore/detail/placeholder-id"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-indigo-950/20 active:scale-[0.98] cursor-pointer"
                  >
                    Baixar Extensão ZapFlow
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Grupo VIP */}
        {activeTab === 'vip' && userPlan === 'annual' && (
          <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
            <div className="border-b border-slate-900 pb-5">
              <h2 className="text-2xl font-bold font-display text-white">Grupo VIP de Suporte</h2>
              <p className="text-slate-405 text-xs mt-1">Networking e estratégias exclusivas de fechamento</p>
            </div>
            <div className="p-8 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-xl text-center space-y-6">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold font-display text-white">Grupo VIP de Suporte</h3>
                <p className="text-slate-400 text-xs max-w-lg mx-auto leading-relaxed">
                  Acesse nosso grupo exclusivo no WhatsApp com estratégias, suporte direto e reuniões mensais.
                </p>
              </div>
              <div className="pt-4">
                <a
                  href="https://chat.whatsapp.com/DwXUNk5x6YJ1G2KHy8JxKX"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-950/20 active:scale-[0.98] cursor-pointer"
                >
                  Entrar no Grupo VIP
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Gerar Leads (Current Search UI) */}
        {activeTab === 'search' && (
          isExpired ? (
            <div className="flex items-center justify-center min-h-[450px] p-4 animate-fade-in">
              <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 shadow-2xl text-center space-y-6">
                <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto animate-pulse-soft">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-display text-white mb-2">Acesso Bloqueado</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">Seu plano venceu. Renove para continuar.</p>
                </div>
                <button
                  onClick={() => setActiveTab('plans')}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] cursor-pointer"
                >
                  Ver Planos
                </button>
              </div>
            </div>
          ) : (
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
                {/* Visual Usage Indicator */}
                <div className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 shadow-xl space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-350 font-semibold">Consumo do Plano</span>
                    <span className={`font-mono text-xs font-bold ${progressTextColor}`}>
                      {`${usageTracking.leads_used || 0} / ${planLimit} leads`}
                    </span>
                  </div>
                  {planLimit > 0 && (
                    <div className="w-full bg-slate-950/50 rounded-full h-2.5 border border-slate-850 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${progressBarColor}`}
                        style={{ width: `${Math.min(100, progressPercent)}%` }}
                      />
                    </div>
                  )}
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    {profile.plan === 'annual' 
                      ? 'Seu plano anual inclui buscas de até 5000 leads por mês.'
                      : `Limite mensal do seu plano ${planNamePt}.`}
                  </p>
                </div>

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
                              <th className="p-4">Nome do Local</th>
                              <th className="p-4">Endereço</th>
                              <th className="p-4">Telefone</th>
                              <th className="p-4">Categoria</th>
                              <th className="p-4 text-center">Website</th>
                              <th className="p-4 text-center">Ações</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-850/60">
                            {currentLeads.length > 0 ? (
                              currentLeads.map((place, idx) => (
                                <tr 
                                  key={idx} 
                                  onClick={() => setSelectedPlace(place)}
                                  className="hover:bg-slate-800/30 text-slate-305 transition-colors cursor-pointer"
                                >
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
                                    {userPlan === 'quarterly' || userPlan === 'annual' ? (
                                      <a
                                        href={`https://wa.me/${getCleanPhone(place.phone)}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-2.5 py-1 bg-green-600/15 border border-green-500/30 text-green-400 hover:bg-green-600 hover:text-white rounded-lg text-[10px] font-semibold transition-all inline-flex items-center gap-1 cursor-pointer"
                                        title="Enviar mensagem individual"
                                      >
                                        📱 WhatsApp
                                      </a>
                                    ) : (
                                      <button
                                        onClick={() => {
                                          setLockModal({
                                            isOpen: true,
                                            title: 'Funcionalidade Bloqueada',
                                            message: 'Faça upgrade do seu plano para liberar esta funcionalidade.'
                                          });
                                        }}
                                        className="px-2.5 py-1 bg-slate-800/50 border border-slate-700/50 text-slate-450 hover:text-slate-300 rounded-lg text-[10px] font-semibold transition-all inline-flex items-center gap-1 cursor-pointer opacity-70"
                                        title="Recurso bloqueado para seu plano"
                                      >
                                        <Lock className="w-3 h-3 text-slate-500" />
                                        <span>WhatsApp</span>
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="6" className="p-8 text-center text-slate-500">
                                  Nenhum resultado corresponde ao filtro "{filterText}"
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination Controls */}
                      {filteredResults.length > 0 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 border-t border-slate-850/60 pt-5 text-xs">
                          <span className="text-slate-400">
                            Mostrando <span className="font-semibold text-slate-200">{showingFrom}</span> a{" "}
                            <span className="font-semibold text-slate-200">{showingTo}</span> de{" "}
                            <span className="font-semibold text-slate-200">{filteredResults.length}</span> leads
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                              disabled={currentPage === 1}
                              className="px-3 py-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 disabled:text-slate-500 disabled:bg-slate-900/30 disabled:border-slate-850/50 border border-slate-750/50 rounded-xl font-medium transition-all active:scale-[0.98] disabled:scale-100 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
                            >
                              Anterior
                            </button>

                            <div className="flex items-center gap-1.5 px-1">
                              <span className="text-slate-400">
                                Página <span className="font-semibold text-slate-200">{currentPage}</span> de{" "}
                                <span className="font-semibold text-slate-200">{totalPages}</span>
                              </span>
                            </div>

                            <button
                              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                              disabled={currentPage === totalPages || totalPages === 0}
                              className="px-3 py-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 disabled:text-slate-500 disabled:bg-slate-900/30 disabled:border-slate-850/50 border border-slate-750/50 rounded-xl font-medium transition-all active:scale-[0.98] disabled:scale-100 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
                            >
                              Próximo
                            </button>
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
        )
      )}

      {/* Tab: Grupos WhatsApp */}
      {activeTab === 'whatsapp_groups' && (
        <div className="space-y-8 animate-fade-in">
          {/* Header */}
          <div className="border-b border-slate-900 pb-5">
            <h2 className="text-2xl font-bold font-display text-white">Grupos WhatsApp</h2>
            <p className="text-slate-400 text-xs mt-1">Busque links de grupos do WhatsApp divulgados em redes sociais</p>
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

                <form onSubmit={handleGroupSearch} className="space-y-5">
                  <div>
                    <label className="block text-slate-350 text-xs font-semibold mb-1.5">Nicho</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                        <Search className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-950/50 border border-slate-850 focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/50 rounded-xl text-xs text-white placeholder-slate-650 outline-none transition-all"
                        placeholder="Ex: barbearia, marketing, vendas"
                        value={groupNiche}
                        onChange={(e) => setGroupNiche(e.target.value)}
                        disabled={searchingGroups}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-355 text-xs font-semibold mb-1.5">Cidade (Opcional)</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                        <MapPin className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-950/50 border border-slate-850 focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/50 rounded-xl text-xs text-white placeholder-slate-650 outline-none transition-all"
                        placeholder="Ex: Fortaleza, São Paulo"
                        value={groupCity}
                        onChange={(e) => setGroupCity(e.target.value)}
                        disabled={searchingGroups}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-355 text-xs font-semibold mb-1.5">Plataforma</label>
                    <select
                      className="w-full px-3 py-2.5 bg-slate-950/50 border border-slate-850 focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/50 rounded-xl text-xs text-white outline-none transition-all cursor-pointer"
                      value={groupPlatform}
                      onChange={(e) => setGroupPlatform(e.target.value)}
                      disabled={searchingGroups}
                      required
                    >
                      <option value="facebook.com" className="bg-[#070b13]">Facebook</option>
                      <option value="instagram.com" className="bg-[#070b13]">Instagram</option>
                      <option value="tiktok.com" className="bg-[#070b13]">TikTok</option>
                      <option value="linkedin.com" className="bg-[#070b13]">LinkedIn</option>
                      <option value="twitter.com" className="bg-[#070b13]">Twitter</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-355 text-xs font-semibold mb-1.5">Limite de Resultados (Máx: 50)</label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      className="w-full px-3 py-2.5 bg-slate-950/50 border border-slate-850 focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/50 rounded-xl text-xs text-white outline-none transition-all"
                      value={groupLimit}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (isNaN(val)) {
                          setGroupLimit('');
                        } else {
                          setGroupLimit(Math.min(50, Math.max(1, val)));
                        }
                      }}
                      onBlur={() => {
                        if (!groupLimit) setGroupLimit(10);
                      }}
                      disabled={searchingGroups}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg hover:shadow-blue-500/10 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    disabled={searchingGroups}
                  >
                    {searchingGroups ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Buscando...
                      </>
                    ) : (
                      <>
                        <Database className="w-4 h-4" />
                        Buscar Grupos
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Data Grid View */}
            <div className="lg:col-span-8">
              {groupError && (
                <div className="p-4 mb-6 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-start gap-3 text-xs animate-fade-in">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <div>
                    <span className="font-bold block">Erro na Consulta</span>
                    <span className="mt-1 block leading-relaxed">{groupError}</span>
                  </div>
                </div>
              )}

              <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-xl min-h-[500px] flex flex-col justify-between">
                {searchingGroups ? (
                  <div className="flex-1 flex flex-col justify-center items-center py-12">
                    <div className="relative mb-6">
                      <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                      <MessageSquare className="w-6 h-6 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
                    </div>
                    <h4 className="text-white text-base font-semibold font-display mb-2">Processando Busca</h4>
                    <p className="text-slate-400 text-xs text-center max-w-sm px-4 leading-relaxed animate-pulse">
                      Fazendo a busca e garimpando links de convite do WhatsApp no Google...
                    </p>
                  </div>
                ) : groupResults.length > 0 ? (
                  <div className="flex-grow flex flex-col h-full">
                    {/* Action headers */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 border-b border-slate-800 pb-5">
                      <div>
                        <h3 className="text-white font-bold font-display text-base flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-emerald-400" />
                          Grupos Encontrados
                        </h3>
                        <p className="text-slate-400 text-xs mt-1">
                          Mapeamos {groupResults.length} grupos únicos com base na sua pesquisa.
                        </p>
                      </div>
                    </div>

                    {/* Results table */}
                    <div className="overflow-x-auto border border-slate-800/80 rounded-xl flex-grow bg-slate-950/20">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-900/40 text-slate-350 border-b border-slate-800/80 font-semibold">
                            <th className="p-4">Link do Grupo</th>
                            <th className="p-4">Título do Resultado</th>
                            <th className="p-4">Origem</th>
                            <th className="p-4 text-center">Ação</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850/60 text-slate-305">
                          {groupResults.map((item, idx) => (
                            <tr 
                              key={idx} 
                              className="hover:bg-slate-800/30 transition-colors"
                            >
                              <td className="p-4 font-semibold text-indigo-400 font-mono select-all">
                                {item.groupLink}
                              </td>
                              <td className="p-4 max-w-[200px] truncate text-slate-200" title={item.title}>
                                {item.title}
                              </td>
                              <td className="p-4 max-w-[150px] truncate text-slate-400" title={item.sourceUrl}>
                                <a 
                                  href={item.sourceUrl} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="hover:underline flex items-center gap-1 text-slate-450 hover:text-slate-200"
                                >
                                  <span>{item.sourceUrl.split('/')[2] || 'Origem'}</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </td>
                              <td className="p-4 text-center">
                                <a
                                  href={item.groupLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-3 py-1.5 bg-green-600/15 border border-green-500/30 text-green-400 hover:bg-green-600 hover:text-white rounded-xl text-[10px] font-bold transition-all inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                                >
                                  Entrar no Grupo
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="flex-grow flex flex-col justify-center items-center py-12 text-center">
                    <div className="p-4 bg-slate-950/50 text-slate-655 rounded-2xl border border-slate-800/60 mb-4">
                      <FileSpreadsheet className="w-12 h-12" />
                    </div>
                    <h4 className="text-white text-base font-bold font-display mb-1.5">Sem resultados para exibir</h4>
                    <p className="text-slate-400 text-xs max-w-sm px-6 leading-relaxed">
                      Preencha os termos de nicho, cidade e escolha a plataforma ao lado para buscar os links de convite indexados.
                    </p>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
              {[
                {
                  name: 'Mensal',
                  price: 'R$ 47',
                  period: '/mês',
                  description: 'Ideal para testar a ferramenta e buscar primeiros leads.',
                  features: [
                    { text: 'Até 500 leads por mês', included: true },
                    { text: 'Acesso completo ao Google Places Crawler', included: true },
                    { text: 'Filtro automático de leads sem website', included: true },
                    { text: 'Exportação ilimitada para CSV', included: true },
                    { text: 'Disparador inteligente', included: false },
                    { text: 'Suporte prioritário', included: false },
                    { text: 'Curso completo de renda extra', included: false },
                    { text: 'Grupo VIP de suporte', included: false },
                    { text: 'Reuniões mensais com estratégias', included: false }
                  ],
                  recommended: false,
                  buttonText: 'Testar agora',
                  link: 'https://pay.cakto.com.br/mihqmub_933107'
                },
                {
                  name: 'Anual',
                  price: 'R$ 197',
                  period: '/ano',
                  subPrice: 'equivalente a R$0,54/dia',
                  description: 'Para agências e equipes que buscam resultados de longo prazo.',
                  features: [
                    { text: '5.000 leads/mês', included: true },
                    { text: 'Acesso completo ao Google Places Crawler', included: true },
                    { text: 'Filtro automático de leads sem website', included: true },
                    { text: 'Exportação para CSV', included: true },
                    { text: 'Disparador inteligente', included: true },
                    { text: 'Suporte prioritário', included: true },
                    { text: 'Curso completo de renda extra', included: true },
                    { text: 'Grupo VIP de suporte', included: true },
                    { text: 'Reuniões mensais com estratégias', included: true },
                    { text: 'Acesso antecipado a novidades', included: true },
                    { text: 'R$197 ao invés de R$564 — economize R$367', included: true }
                  ],
                  recommended: false,
                  buttonText: 'Garantir o melhor preço',
                  link: 'https://pay.cakto.com.br/cx86ktu'
                }
              ].map((plan, idx) => (
                <div 
                  key={idx}
                  className={`p-6 rounded-2xl bg-slate-900/60 backdrop-blur-xl border flex flex-col justify-between transition-all relative ${
                    plan.recommended 
                      ? 'border-indigo-500' 
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
                    
                    <div className="my-6">
                      <div className="flex items-baseline">
                        <span className="text-3xl font-extrabold text-white">{plan.price}</span>
                        <span className="text-slate-400 text-xs font-semibold ml-1">{plan.period}</span>
                      </div>
                      {plan.subPrice && (
                        <div className="text-[10px] text-slate-500 mt-1 font-medium">
                          {plan.subPrice}
                        </div>
                      )}
                    </div>

                    <ul className="space-y-3 border-t border-slate-800/50 pt-5 text-xs text-slate-300">
                      {plan.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2">
                          {feat.included ? (
                            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                          )}
                          <span className={feat.included ? 'text-slate-300' : 'text-slate-500'}>
                            {feat.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <a
                    href={plan.link}
                    className={`w-full text-center block py-2.5 mt-8 text-xs font-bold rounded-xl transition-all active:scale-[0.98] cursor-pointer ${
                      plan.recommended
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow shadow-blue-500/10'
                        : 'bg-slate-800 hover:bg-slate-750 text-slate-200'
                    }`}
                  >
                    {plan.buttonText}
                  </a>
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

              {isExpired ? (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-2 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0 animate-pulse" />
                  <span>Plano vencido — renove para continuar</span>
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
                  <span className="text-white font-bold block mt-1 text-sm">
                    {profile.plan === 'free' ? 'Gratuito' : 
                     profile.plan === 'monthly' ? 'Mensal' : 
                     profile.plan === 'quarterly' ? 'Trimestral' : 
                     profile.plan === 'annual' ? 'Anual' : profile.plan}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-950/50 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block">Vencimento</span>
                  <span className="text-white font-bold block mt-1 text-sm">
                    {profile.plan === 'free' || !profile.plan_expires_at
                      ? 'Sem vencimento'
                      : (() => {
                          const dateOnly = profile.plan_expires_at.substring(0, 10);
                          const parts = dateOnly.split('-');
                          return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : profile.plan_expires_at;
                        })()}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-950/50 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block">Tempo Restante</span>
                  <span className={`font-bold block mt-1 text-sm ${isExpired ? 'text-red-450' : 'text-white'}`}>
                    {profile.plan === 'free' ? '—' : (isExpired ? 'Expirado' : `${daysRemaining} dias`)}
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

      {/* Lock Warning Modal */}
      {lockModal.isOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-850 rounded-2xl p-6 shadow-2xl animate-scale-up text-center space-y-6">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-white mb-2">{lockModal.title}</h3>
              <p className="text-slate-400 text-xs leading-relaxed">{lockModal.message}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => setLockModal(prev => ({ ...prev, isOpen: false }))}
                className="w-full py-2.5 border border-slate-800 hover:bg-slate-855 text-slate-300 hover:text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                Voltar
              </button>
              <button
                onClick={() => {
                  setLockModal(prev => ({ ...prev, isOpen: false }));
                  setActiveTab('plans');
                }}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow-lg hover:shadow-blue-500/20 cursor-pointer"
              >
                Ver Planos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating WhatsApp Button */}
      <div className="group fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center">
        <div className="absolute right-14 sm:right-16 bg-slate-900/95 text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-800 shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap translate-x-2 group-hover:translate-x-0 backdrop-blur-sm">
          Suporte via WhatsApp
        </div>
        <a
          href="https://wa.me/5585988653086"
          target="_blank"
          rel="noreferrer"
          className="relative w-12 h-12 sm:w-14 sm:h-14 bg-[#25D366] hover:bg-[#22c35e] text-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer animate-whatsapp-pulse"
          aria-label="Suporte via WhatsApp"
        >
          <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 24 24" fill="currentColor">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.86.002-2.636-1.022-5.11-2.884-6.973C16.53 1.889 14.05 .865 11.414.865c-5.433 0-9.85 4.417-9.855 9.856-.002 1.714.453 3.39 1.317 4.878L1.87 20.36l5.051-1.325c-.004-.001-.004-.001-.005-.001zm11.477-7.63c-.327-.164-1.93-.953-2.229-1.062-.299-.11-.517-.164-.736.164-.218.327-.844 1.062-1.035 1.281-.19.219-.382.246-.708.082-1.123-.563-1.931-.98-2.703-2.302-.204-.349.204-.324.582-1.08.06-.12.03-.225-.015-.317-.045-.09-.382-.92-.523-1.26-.138-.33-.278-.286-.382-.292l-.326-.005c-.11 0-.289.042-.44.205-.152.164-.582.569-.582 1.388 0 .819.596 1.611.679 1.72.083.11 1.173 1.79 2.84 2.508.397.171.706.273.948.35.4.127.763.109 1.05.066.32-.048.953-.39 1.087-.768.134-.378.134-.702.094-.768-.04-.067-.15-.107-.478-.27z"/>
          </svg>
        </a>
      </div>

    </div>
  );
}
