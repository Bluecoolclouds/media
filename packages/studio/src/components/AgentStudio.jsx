"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getTemplateAgents,
  getUserAgents,
  getUserConversations,
} from "../muapi.js";
import { useLang, makeT } from "../i18n/useLang";
import { agentStudioDict } from "../i18n/dictionaries/agentStudio";

// ─── Helpers ────────────────────────────────────────────────────────────────
function timeAgo(dateStr, t) {
  if (!dateStr) return "";
  const utcStr =
    dateStr.endsWith("Z") || dateStr.includes("+") ? dateStr : dateStr + "Z";
  const diff = Math.floor((Date.now() - new Date(utcStr)) / 1000);
  if (diff < 60) return t('time.justNow');
  if (diff < 3600) return t('time.minutesAgo')(Math.floor(diff / 60));
  if (diff < 86400) return t('time.hoursAgo')(Math.floor(diff / 3600));
  if (diff < 604800) return t('time.daysAgo')(Math.floor(diff / 86400));
  return new Date(utcStr).toLocaleDateString();
}

// ─── Agent Card (grid) ───────────────────────────────────────────────────────
function AgentCard({ agent, onClick, onEdit, t }) {
  return (
    <div className="group relative aspect-[4/5] rounded-xl cursor-pointer">
      <div
        onClick={() => onClick(agent)}
        className="absolute inset-0 rounded-xl overflow-hidden border border-white/5 bg-[#0a0a0a] transition-all group-hover:border-[#22d3ee]/30 group-hover:scale-[1.02] shadow-2xl"
      >
        {agent.icon_url ? (
          <img
            src={agent.icon_url}
            alt={agent.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1" className="opacity-20">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <div className="text-[10px] font-bold text-[#22d3ee] uppercase tracking-wider mb-1 opacity-80">
            {agent.category || t('card.defaultCategory')}
          </div>
          <h3 className="text-sm font-bold text-white truncate group-hover:text-[#22d3ee] transition-colors">
            {agent.name || t('card.unnamedAgent')}
          </h3>
          {agent.owner_username && (
            <p className="text-[9px] text-white/40 mt-1 uppercase tracking-tighter font-black">
              {t('card.byOwner')(agent.owner_username)}
            </p>
          )}
        </div>
      </div>
      
      {onEdit && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(agent);
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-[#22d3ee] hover:text-black hover:scale-110 z-10"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
      )}
    </div>
  );
}

// ─── Conversation Card (My Chats) ────────────────────────────────────────────
function ConversationCard({ conv, onClick, t }) {
  const displayTitle = conv.title || "New Chat";
  const agentSlug = conv.agent_slug || conv.agent_id;
  return (
    <div
      onClick={() => onClick(agentSlug, conv.id)}
      className="group flex flex-col gap-3 bg-white/[0.03] border border-white/5 rounded-xl p-4 hover:border-[#22d3ee]/20 hover:bg-white/5 transition-all cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-white/5 border border-white/5 shrink-0">
          {conv.agent_icon_url ? (
            <img src={conv.agent_icon_url} alt={conv.agent_name || "Agent"} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/20">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black text-[#22d3ee] uppercase tracking-wider truncate">
            {conv.agent_name || t('card.unknownAgent')}
          </p>
          <p className="text-sm font-bold text-white truncate" title={displayTitle}>
            {displayTitle}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-auto text-[10px] text-white/30 font-medium">
        <span>{timeAgo(conv.updated_at, t)}</span>
        {conv.message_count != null && <span>{t('card.msgs')(conv.message_count)}</span>}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
const TABS = ["templates", "my-agents", "my-chats"];
const TAB_KEYS = {
  "templates": "tab.templates",
  "my-agents": "tab.myAgents",
  "my-chats": "tab.myChats",
};

export default function AgentStudio({ apiKey }) {
  const router = useRouter();
  const lang = useLang();
  const t = makeT(agentStudioDict, lang);

  const [activeMainTab, setActiveMainTab] = useState("templates");
  const [agents, setAgents] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Navigate to the standalone /agents page — AiAgent handles its own routing there
  const handleSelectAgent = useCallback(
    (agent) => {
      const id = agent.agent_id || agent.id;
      router.push(`/agents/${id}`);
    },
    [router]
  );

  const handleEditAgent = useCallback(
    (agent) => {
      const id = agent.agent_id || agent.id;
      router.push(`/agents/edit/${id}`);
    },
    [router]
  );

  const handleCreateAgent = useCallback(() => {
    router.push("/agents/create");
  }, [router]);

  const handleOpenConversation = useCallback(
    (agentSlug, convId) => {
      router.push(`/agents/${agentSlug}/${convId}`);
    },
    [router]
  );

  useEffect(() => {
    if (!apiKey) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setAgents([]);
      setConversations([]);
      try {
        if (activeMainTab === "templates") {
          const data = await getTemplateAgents(apiKey);
          if (!cancelled) setAgents(data);
        } else if (activeMainTab === "my-agents") {
          const data = await getUserAgents(apiKey);
          if (!cancelled) setAgents(data);
        } else if (activeMainTab === "my-chats") {
          const data = await getUserConversations(apiKey);
          if (!cancelled) setConversations(data);
        }
      } catch (err) {
        console.error("AgentStudio load error:", err);
        if (!cancelled) setError(err.message || "Failed to load.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [apiKey, activeMainTab]);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="h-full flex flex-col bg-[#030303] text-white">
      {/* Header */}
      <div className="flex-shrink-0 h-16 border-b border-white/5 flex items-center justify-between px-8 bg-black/40">
        <div className="flex items-center gap-8 h-full">
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#22d3ee]">
            {t('header.title')}
          </h2>
          <div className="flex gap-1 bg-white/5 p-1 rounded-xl">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveMainTab(tab)}
                className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                  activeMainTab === tab
                    ? "bg-white text-black shadow-xl"
                    : "text-white/40 hover:text-white hover:bg-white/5"
                }`}
              >
                {t(TAB_KEYS[tab])}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleCreateAgent}
          className="px-6 py-2 bg-[#22d3ee] text-black text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-[#ebff66] transition-all active:scale-95 flex items-center gap-2"
        >
          <span className="text-sm">+</span>
          {t('create').replace(/^\+\s*/, '')}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-white/5 border-t-[#22d3ee] rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="h-full flex flex-col items-center justify-center text-white/20 gap-4">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-xs font-bold uppercase tracking-widest">{error}</p>
            <button
              onClick={() => setActiveMainTab(activeMainTab)} // retrigger effect
              className="text-[10px] text-white/40 hover:text-white border border-white/10 px-4 py-2 rounded-lg transition-colors"
            >
              {t('retry')}
            </button>
          </div>
        ) : activeMainTab === "my-chats" ? (
          // ── My Chats view ─────────────────────────────────────────────────
          conversations.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center animate-fade-in-up transition-all duration-700 min-h-[50vh] relative">
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="w-[460px] h-[460px] bg-[#22d3ee]/10 blur-[150px] rounded-full opacity-70" />
              </div>
              <div className="relative z-10 mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22d3ee] animate-pulse" />
                <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-white/60">{t('empty.myChatsBadge')}</span>
              </div>
              <h2 className="relative z-10 text-3xl sm:text-4xl md:text-5xl font-black text-center leading-[0.95] tracking-tighter mb-4 px-4">
                <span className="block text-white">{t('empty.noConversations')}</span>
                <span className="block bg-gradient-to-r from-[#22d3ee] via-[#38bdf8] to-[#a855f7] bg-clip-text text-transparent">{t('empty.justYet')}</span>
              </h2>
              <p className="relative z-10 text-white/50 text-sm md:text-base font-medium text-center max-w-md leading-relaxed mb-8 px-4">
                {t('empty.chatsDesc')}
              </p>
              <button
                onClick={() => setActiveMainTab("templates")}
                className="relative z-10 text-[11px] font-bold uppercase tracking-widest text-black bg-[#22d3ee] hover:bg-[#e5ff33] px-5 py-2.5 rounded-lg transition-all hover:scale-105 active:scale-95"
              >
                {t('empty.browseTemplates')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-[1600px] mx-auto">
              {conversations.map((conv) => (
                <ConversationCard
                  key={conv.id}
                  conv={conv}
                  onClick={handleOpenConversation}
                  t={t}
                />
              ))}
            </div>
          )
        ) : (
          // ── Agents grid (templates / my-agents) ───────────────────────────
          agents.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center animate-fade-in-up transition-all duration-700 min-h-[50vh] relative">
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="w-[460px] h-[460px] bg-[#22d3ee]/10 blur-[150px] rounded-full opacity-70" />
              </div>
              <div className="relative z-10 mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22d3ee] animate-pulse" />
                <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-white/60">{t('empty.agentsBadge')}</span>
              </div>
              <h2 className="relative z-10 text-3xl sm:text-4xl md:text-5xl font-black text-center leading-[0.95] tracking-tighter mb-4 px-4">
                <span className="block text-white">{activeMainTab === "my-agents" ? t('empty.buildFirst') : t('empty.noAgents')}</span>
                <span className="block bg-gradient-to-r from-[#22d3ee] via-[#38bdf8] to-[#a855f7] bg-clip-text text-transparent">
                  {activeMainTab === "my-agents" ? t('empty.aiAgent') : t('empty.foundHere')}
                </span>
              </h2>
              <p className="relative z-10 text-white/50 text-sm md:text-base font-medium text-center max-w-md leading-relaxed mb-8 px-4">
                {activeMainTab === "my-agents"
                  ? t('empty.myAgentsDesc')
                  : t('empty.templatesDesc')}
              </p>
              {activeMainTab === "my-agents" && (
                <button
                  onClick={handleCreateAgent}
                  className="relative z-10 text-[11px] font-bold uppercase tracking-widest text-black bg-[#22d3ee] hover:bg-[#e5ff33] px-5 py-2.5 rounded-lg transition-all hover:scale-105 active:scale-95"
                >
                  {t('empty.createAgent')}
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 max-w-[1600px] mx-auto">
              {agents.map((agent) => (
                <AgentCard
                  key={agent.agent_id || agent.id}
                  agent={agent}
                  onClick={handleSelectAgent}
                  t={t}
                />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
