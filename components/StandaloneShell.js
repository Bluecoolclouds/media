'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import axios from 'axios';
// Deep imports, never the `studio` barrel: the barrel statically re-exports all 15
// studios, so a single named import from it pulls every studio into this page's
// first load and defeats the dynamic() splitting below.
import { getUserBalance } from 'studio/src/muapi';
import { useLang, makeT } from 'studio/src/i18n/useLang';
import { setLang as setAppLang, LANG_CYCLE } from 'studio/src/i18n/core';
import { shellDict } from 'studio/src/i18n/dictionaries/shell';
import ApiKeyModal from './ApiKeyModal';
import AuthModal from './AuthModal';
import SiteHeader from './SiteHeader';

// Each studio is code-split so a tab only downloads the bundle it needs.
// Previously all 14 studios (incl. reactflow ~676KB, syntax-highlighter ~1.5MB)
// loaded on every /studio visit — that was the source of the long spinner.
const StudioLoader = () => (
  <div className="h-full w-full flex items-center justify-center text-[#22d3ee]/60">
    <div className="animate-spin text-3xl">◌</div>
  </div>
);
// Each import path must be a literal pointing at one component file. Routing them
// all through import('studio') would put every studio in one shared async chunk,
// so opening any tab would download all 14.
const lazyStudio = (load) => dynamic(load, { ssr: false, loading: StudioLoader });

const ImageStudio = lazyStudio(() => import('studio/src/components/ImageStudio'));
const VideoStudio = lazyStudio(() => import('studio/src/components/VideoStudio'));
const AvatarStudio = lazyStudio(() => import('studio/src/components/AvatarStudio'));
const ClippingStudio = lazyStudio(() => import('studio/src/components/ClippingStudio'));
const VibeMotionStudio = lazyStudio(() => import('studio/src/components/VibeMotionStudio'));
const LipSyncStudio = lazyStudio(() => import('studio/src/components/LipSyncStudio'));
const RecastStudio = lazyStudio(() => import('studio/src/components/RecastStudio'));
const CinemaStudio = lazyStudio(() => import('studio/src/components/CinemaStudio'));
const AudioStudio = lazyStudio(() => import('studio/src/components/AudioStudio'));
const MarketingStudio = lazyStudio(() => import('studio/src/components/MarketingStudio'));
const ProductCardStudio = lazyStudio(() => import('studio/src/components/ProductCardStudio'));
const WorkflowStudio = lazyStudio(() => import('studio/src/components/WorkflowStudio'));
const AgentStudio = lazyStudio(() => import('studio/src/components/AgentStudio'));
const DesignAgentStudio = lazyStudio(() => import('studio/src/components/DesignAgentStudio'));

const AUTH_KEY = 'apinet_auth';       // { email, key } persisted after login
const ENV_KEY = process.env.NEXT_PUBLIC_MUAPI_KEY || '';

const TAB_IDS = [
  { id: 'image',   key: 'tabs.image' },
  { id: 'video',   key: 'tabs.video' },
  { id: 'avatar',  key: 'tabs.avatar' },
  { id: 'audio',   key: 'tabs.audio' },
  { id: 'clipping', key: 'tabs.clipping' },
  { id: 'vibe-motion', key: 'tabs.vibeMotion' },
  { id: 'lipsync', key: 'tabs.lipsync' },
  { id: 'body-swap', key: 'tabs.bodySwap' },
  { id: 'cinema',  key: 'tabs.cinema' },
  { id: 'marketing', key: 'tabs.marketing' },
  { id: 'product-card', key: 'tabs.productCard' },
  { id: 'workflows', key: 'tabs.workflows' },
  { id: 'agents', key: 'tabs.agents' },
  { id: 'design-agent', key: 'tabs.designAgent' },
];

const STORAGE_KEY = 'muapi_key';

export default function StandaloneShell() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug || [];
  const idFromParams = params?.id;
  const tabFromParams = params?.tab;

  // Helper to extract workflow details precisely from either route structure
  const getWorkflowInfo = useCallback(() => {
    if (idFromParams) {
        return { id: idFromParams, tab: tabFromParams || null };
    }
    const wfIndex = slug.findIndex(s => s === 'workflows' || s === 'workflow');
    if (wfIndex === -1) return { id: null, tab: null };
    return {
      id: slug[wfIndex + 1] || null,
      tab: slug[wfIndex + 2] || null
    };
  }, [slug, idFromParams, tabFromParams]);

  const { id: urlWorkflowId } = getWorkflowInfo();

  // Initialize activeTab from URL slug/params or default to 'image'
  const getInitialTab = () => {
    if (idFromParams || slug.includes('workflow')) return 'workflows';
    if (slug.includes('agents')) return 'agents';
    if (slug.includes('design-agent')) return 'design-agent';
    const firstSegment = slug[0];
    if (firstSegment && TAB_IDS.find(tb => tb.id === firstSegment)) return firstSegment;
    return 'image';
  };

  const [apiKey, setApiKey] = useState(null);
  const [activeTab, setActiveTab] = useState(getInitialTab());
  const lang = useLang();
  const t = makeT(shellDict, lang);

  const [balance, setBalance] = useState(null);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);

  // Account state
  const [userEmail, setUserEmail] = useState(null);
  const [isAuthed, setIsAuthed] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  // Drag and Drop State
  const [isDragging, setIsDragging] = useState(false);
  const [droppedFiles, setDroppedFiles] = useState(null);

  // Sync tab with URL if user navigates manually or via browser back/forward
  useEffect(() => {
    const info = getWorkflowInfo();
    if (info.id) {
        setActiveTab('workflows');
    } else if (slug.includes('agents')) {
        setActiveTab('agents');
    } else if (slug.includes('design-agent')) {
        setActiveTab('design-agent');
    } else {
        const firstSegment = slug[0];
        if (firstSegment && TAB_IDS.find(tb => tb.id === firstSegment)) {
          setActiveTab(firstSegment);
        }
    }
  }, [slug, getWorkflowInfo]);

  const handleTabChange = (tabId) => {
    router.push(`/studio/${tabId}`);
    // setActiveTab(tabId);
  };

  // Auto-hide header when inside a specific workflow view or design agent
  useEffect(() => {
    const isEditingWorkflow = (activeTab === 'workflows' || !!idFromParams) && urlWorkflowId;
    const isDesignAgent = activeTab === 'design-agent';

    if (isEditingWorkflow || isDesignAgent) {
      setIsHeaderVisible(false);
    } else {
      setIsHeaderVisible(true);
    }
  }, [activeTab, urlWorkflowId, idFromParams]);

  // Global builder CSS cleanup when switching away from Workflows or Design Agent tabs
  useEffect(() => {
    const fromBuilder = sessionStorage.getItem("fromWorkflowBuilder");
    const fromDesignAgent = sessionStorage.getItem("fromDesignAgent");

    if ((fromBuilder && activeTab !== 'workflows') || (fromDesignAgent && activeTab !== 'design-agent')) {
      sessionStorage.removeItem("fromWorkflowBuilder");
      sessionStorage.removeItem("fromDesignAgent");
      window.location.reload();
    }
  }, [activeTab]);

  const fetchBalance = useCallback(async (key) => {
    try {
      const data = await getUserBalance(key);
      setBalance(data.balance);
    } catch (err) {
      console.error('Balance fetch failed:', err);
    }
  }, []);

  useEffect(() => {
    setHasMounted(true);

    // Restore a previous session (email + optional per-user key).
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data?.email) {
          setUserEmail(data.email);
          setIsAuthed(true);
        }
      }
    } catch (_) {}

    // Resolve the working API key: stored key → session key → env fallback.
    const stored = localStorage.getItem(STORAGE_KEY) || ENV_KEY;
    if (stored) {
      setApiKey(stored);
      fetchBalance(stored);
      document.cookie = `muapi_key=${stored}; path=/; max-age=31536000; SameSite=Lax`;
    }

  }, [fetchBalance]);

  // Only prompt sign-in when the user actually tries to sign up/generate
  // and the API tells us they're unauthorized (401/403), not on every page load.
  useEffect(() => {
    const handleAuthRequired = () => setShowAuth(true);
    window.addEventListener('muapi:auth-required', handleAuthRequired);
    return () => window.removeEventListener('muapi:auth-required', handleAuthRequired);
  }, []);

  // Called by AuthModal on successful sign-in / sign-up.
  const handleAuthSuccess = useCallback(({ key, email }) => {
    setUserEmail(email);
    setIsAuthed(true);
    setShowAuth(false);
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      const prev = raw ? JSON.parse(raw) : {};
      localStorage.setItem(AUTH_KEY, JSON.stringify({ ...prev, email, signedInAt: new Date().toISOString() }));
    } catch (_) {}

    // Prefer a user-provided key; otherwise fall back to the env/shared key so the studio works.
    const effectiveKey = (key && key.trim()) || ENV_KEY;
    if (effectiveKey) {
      localStorage.setItem(STORAGE_KEY, effectiveKey);
      setApiKey(effectiveKey);
      fetchBalance(effectiveKey);
      document.cookie = `muapi_key=${effectiveKey}; path=/; max-age=31536000; SameSite=Lax`;
    }
  }, [fetchBalance]);

  const handleSignOut = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(STORAGE_KEY);
    setUserEmail(null);
    setIsAuthed(false);
    setApiKey(null);
    setBalance(null);
    document.cookie = "muapi_key=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setShowAuth(true);
  }, []);

  const handleLangChange = useCallback(() => {
    const next = LANG_CYCLE[(LANG_CYCLE.indexOf(lang) + 1) % LANG_CYCLE.length];
    setAppLang(next);
  }, [lang]);

  const handleKeySave = useCallback((key) => {
    localStorage.setItem(STORAGE_KEY, key);
    setApiKey(key);
    fetchBalance(key);
    document.cookie = `muapi_key=${key}; path=/; max-age=31536000; SameSite=Lax`;
  }, [fetchBalance]);

  // Inject API key into all outgoing Axios requests (prop-based approach)
  // We use an interceptor to be selective and NOT send the key to external domains like S3
  useEffect(() => {
    // Safety: Clear any global defaults that might have been set previously
    delete axios.defaults.headers.common['x-api-key'];

    if (!apiKey) return;

    const interceptorId = axios.interceptors.request.use((config) => {
      // Check if URL is local/proxied
      const isRelative = config.url.startsWith('/') || !config.url.startsWith('http');
      const isInternalProxy = config.url.includes('/api/app') || config.url.includes('/api/workflow') || config.url.includes('/api/agents') || config.url.includes('/api/api') || config.url.includes('/api/v1');

      if (isRelative || isInternalProxy) {
        config.headers['x-api-key'] = apiKey;
      }

      return config;
    });

    return () => {
      axios.interceptors.request.eject(interceptorId);
    };
  }, [apiKey]);

  // Poll for balance every 30 seconds if key is present
  useEffect(() => {
    if (!apiKey) return;
    const interval = setInterval(() => fetchBalance(apiKey), 30000);
    return () => clearInterval(interval);
  }, [apiKey, fetchBalance]);

  // Drag and Drop Handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set to false if we're leaving the container itself, not moving between children
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setDroppedFiles(files);
    }
  }, []);

  const handleFilesHandled = useCallback(() => {
    setDroppedFiles(null);
  }, []);

  if (!hasMounted) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="animate-spin text-[#22d3ee] text-3xl">◌</div>
    </div>
  );

  return (
    <div
      className="h-screen bg-[#030303] flex flex-col overflow-hidden text-white relative"
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag Overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-[100] bg-[#22d3ee]/10 backdrop-blur-md border-4 border-dashed border-[#22d3ee]/50 flex items-center justify-center pointer-events-none transition-all duration-300">
          <div className="bg-[#0a0a0a] p-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col items-center gap-4 scale-110 animate-pulse">
            <div className="w-20 h-20 bg-[#22d3ee] rounded-2xl flex items-center justify-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
              </svg>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold text-white">{t('drop.title')}</span>
              <span className="text-sm text-white/40">{t('drop.subtitle')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Header — compact pill-nav layout modeled on higgsfield.ai's header */}
      {isHeaderVisible && (
        <SiteHeader
          lang={lang}
          onLangChange={handleLangChange}
          balance={balance}
          isAuthed={isAuthed}
          userEmail={userEmail}
          onSignIn={() => setShowAuth(true)}
          onSignOut={handleSignOut}
          centerContent={
            <nav className="flex-1 min-w-0 relative overflow-hidden h-full flex items-center">
              <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[#030303] to-transparent pointer-events-none z-10" />

              <ul className="flex items-center gap-0.5 overflow-x-auto scrollbar-none h-full px-2">
                {TAB_IDS.map((tab, i) => (
                  <li key={tab.id} className="flex items-center flex-shrink-0">
                    <button
                      onClick={() => handleTabChange(tab.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-[13px] font-medium whitespace-nowrap transition-colors ${
                        activeTab === tab.id
                          ? 'bg-white/10 text-white'
                          : 'text-white/50 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {t(tab.key)}
                    </button>
                    {(i === 3 || i === 10) && (
                      <span className="mx-1 h-3.5 w-px bg-white/10 flex-shrink-0" aria-hidden="true" />
                    )}
                  </li>
                ))}
              </ul>

              <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[#030303] to-transparent pointer-events-none z-10" />
            </nav>
          }
        />
      )}

      {/* Auth modal */}
      {showAuth && (
        <AuthModal
          onSuccess={handleAuthSuccess}
          onClose={() => setShowAuth(false)}
        />
      )}

      {/* Studio Content */}
      <div className="flex-1 min-h-0 relative overflow-hidden">
        {activeTab === 'image'   && <ImageStudio   apiKey={apiKey} droppedFiles={droppedFiles} onFilesHandled={handleFilesHandled} />}
        {activeTab === 'video'   && <VideoStudio   apiKey={apiKey} droppedFiles={droppedFiles} onFilesHandled={handleFilesHandled} />}
        {activeTab === 'avatar'  && <AvatarStudio  apiKey={apiKey} />}
        {activeTab === 'clipping' && <ClippingStudio apiKey={apiKey} droppedFiles={droppedFiles} onFilesHandled={handleFilesHandled} />}
        {activeTab === 'vibe-motion' && <VibeMotionStudio apiKey={apiKey} />}
        {activeTab === 'lipsync' && <LipSyncStudio apiKey={apiKey} droppedFiles={droppedFiles} onFilesHandled={handleFilesHandled} />}
        {activeTab === 'body-swap' && <RecastStudio apiKey={apiKey} droppedFiles={droppedFiles} onFilesHandled={handleFilesHandled} />}
        {activeTab === 'cinema'  && <CinemaStudio  apiKey={apiKey} />}
        {activeTab === 'audio'   && <AudioStudio   apiKey={apiKey} droppedFiles={droppedFiles} onFilesHandled={handleFilesHandled} />}
        {activeTab === 'marketing' && <MarketingStudio apiKey={apiKey} droppedFiles={droppedFiles} onFilesHandled={handleFilesHandled} />}
        {activeTab === 'product-card' && <ProductCardStudio apiKey={apiKey} droppedFiles={droppedFiles} onFilesHandled={handleFilesHandled} />}
        {activeTab === 'workflows' && <WorkflowStudio apiKey={apiKey} isHeaderVisible={isHeaderVisible} onToggleHeader={setIsHeaderVisible} />}
        {activeTab === 'agents' && <AgentStudio apiKey={apiKey} isHeaderVisible={isHeaderVisible} onToggleHeader={setIsHeaderVisible} />}
        {activeTab === 'design-agent' && <DesignAgentStudio apiKey={apiKey} isHeaderVisible={isHeaderVisible} onToggleHeader={setIsHeaderVisible} />}
      </div>
    </div>
  );
}
