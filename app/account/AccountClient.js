'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { useLang } from 'studio/src/i18n/useLang';
import { setLang as setAppLang, LANG_CYCLE, LANG_LABEL } from 'studio/src/i18n/core';
import AccountShell from '@/components/account/AccountShell';
import { useAccountAuth, signOutAndClear } from '@/components/account/useAccountAuth';
import { saveMuapiKey, deleteMuapiKey } from '@/lib/muapiKeyClient';

const LANG_FULL_LABEL = { en: 'English', ru: 'Русский' };

function EditIcon() {
  return (
    <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

function ChevronIcon({ open }) {
  return (
    <svg
      width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
      className={`shrink-0 text-white/40 transition-transform ${open ? 'rotate-180' : ''}`}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function initials(email, name) {
  if (name) return name.trim()[0].toUpperCase();
  if (!email) return 'U';
  return email.trim()[0].toUpperCase();
}

export default function AccountClient() {
  const router = useRouter();
  const lang = useLang();
  // Identity (name/email) comes from the NextAuth session and is read-only here.
  // The MuAPI key is saved encrypted on the server; the form only ever shows a mask.
  const { hasMounted, email, name, maskedKey, setMaskedKey, setApiKey, usd, credits, username, fetchBalance } = useAccountAuth();

  const [editing, setEditing] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const startEditing = () => {
    // Never prefill the real key; the input is write-only.
    setApiKeyInput('');
    setEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) {
      setEditing(false);
      return;
    }
    setSaving(true);
    const result = await saveMuapiKey(apiKeyInput);
    setSaving(false);
    if (!result.ok) {
      toast.error(result.error || 'Failed to save API key');
      return;
    }
    setApiKey(result.key);
    setMaskedKey(result.masked);
    fetchBalance(result.key);
    setApiKeyInput('');
    toast.success(result.source === 'server' ? 'API key saved to your account' : 'API key saved in this browser');
    setEditing(false);
  };

  const handleRemoveKey = async () => {
    setSaving(true);
    await deleteMuapiKey();
    setSaving(false);
    setApiKey('');
    setMaskedKey(null);
    toast.success('API key removed');
    setEditing(false);
  };

  const handleSignOut = () => signOutAndClear('/');

  if (!hasMounted) return null;

  const maxPoolCredits = 1000000; // informational cap used only for the progress bar
  const creditsPct = credits != null ? Math.min(100, Math.round((credits / maxPoolCredits) * 100)) : 0;

  return (
    <AccountShell>
      <Toaster
        position="top-right"
        toastOptions={{ style: { background: 'rgba(0,0,0,0.9)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }}
      />

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="size-14 rounded-full bg-gradient-to-br from-[#22d3ee] to-[#a855f7] flex items-center justify-center text-black text-xl font-black shrink-0">
          {initials(email, name)}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight truncate">{name || username}</h1>
            <button
              type="button"
              onClick={startEditing}
              className="flex items-center gap-1 text-xs text-white/40 hover:text-white transition-colors"
            >
              <EditIcon />
              Edit
            </button>
          </div>
          <p className="text-sm text-white/50 truncate">{email || 'Not signed in'}</p>
        </div>
      </div>

      {editing && (
        <form onSubmit={handleSave} className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
          <p className="text-[11px] text-white/35">Name and email come from your sign-in account and can't be edited here.</p>
          <div className="space-y-1.5">
            <label htmlFor="apiKey" className="block text-xs font-medium text-white/50">
              API key {maskedKey && <span className="font-mono text-white/35">(current: {maskedKey})</span>}
            </label>
            <input
              id="apiKey"
              type="password"
              autoComplete="off"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder={maskedKey ? 'Enter a new key to replace it' : 'sk-...'}
              className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 text-white text-sm rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 focus:outline-none placeholder:text-white/20 font-mono"
            />
            <p className="text-[11px] text-white/35">Stored encrypted with your account. Used to generate content and fetch your balance.</p>
          </div>
          {maskedKey && (
            <button
              type="button"
              onClick={handleRemoveKey}
              disabled={saving}
              className="text-xs font-medium text-red-400 hover:text-red-300 disabled:opacity-50"
            >
              Remove saved key
            </button>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-lg bg-[#22d3ee] text-black text-sm font-semibold hover:bg-[#5eeaff] transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-4 py-2.5 rounded-lg bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Work email (not supported — informational, honest about the gap) */}
      <section className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-white/40">
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-10 6L2 7" />
            </svg>
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white">Work email</p>
            <p className="text-xs text-white/40 truncate">Not available for apinet.cloud accounts yet</p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-white/5 px-3 py-1 text-[11px] font-medium text-white/40">Coming soon</span>
      </section>

      {/* Credits + quick nav */}
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white/70">Credits</span>
            <button type="button" onClick={() => router.push('/account/usage')} className="text-xs text-cyan-400 hover:text-cyan-300">
              Usage history
            </button>
          </div>
          <p className="mt-3 text-2xl font-bold">{credits != null ? credits.toLocaleString() : '—'} <span className="text-sm font-medium text-white/40">credits left</span></p>
          {usd != null && <p className="mt-0.5 text-xs text-white/40">${usd} balance</p>}
          <div className="mt-3 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-[#22d3ee] to-[#a855f7]" style={{ width: `${creditsPct}%` }} />
          </div>
          <button
            type="button"
            onClick={() => router.push('/pricing')}
            className="mt-4 flex h-9 w-full items-center justify-center rounded-lg bg-[#22d3ee] text-black text-sm font-semibold hover:bg-[#5eeaff] transition-colors"
          >
            Upgrade plan
          </button>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <span className="text-sm font-medium text-white/70">Application language</span>
          <p className="mt-1 text-xs text-white/40">Used across the studio interface.</p>
          <div className="relative mt-4">
            <button
              type="button"
              onClick={() => setLangOpen((o) => !o)}
              className="flex h-10 w-full items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3.5 text-sm font-medium text-white hover:bg-white/10 transition-colors"
            >
              {LANG_FULL_LABEL[lang] || LANG_LABEL[lang]}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="text-white/40">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {langOpen && (
              <div className="absolute left-0 right-0 top-full mt-1 rounded-xl bg-[#161618] border border-white/10 shadow-xl p-1 z-10">
                {LANG_CYCLE.map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => { setAppLang(code); setLangOpen(false); }}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      lang === code ? 'text-[#22d3ee] bg-[#22d3ee]/10' : 'text-white/70 hover:bg-white/5'
                    }`}
                  >
                    {LANG_FULL_LABEL[code] || LANG_LABEL[code]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Account deletion */}
      <section className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
        <button
          type="button"
          onClick={() => setDeleteOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-4 p-5 text-left"
        >
          <div>
            <p className="text-sm font-semibold text-white">Manage Account Deletion</p>
            <p className="mt-0.5 text-xs text-white/40">Account deletion settings</p>
          </div>
          <ChevronIcon open={deleteOpen} />
        </button>

        {deleteOpen && (
          <div className="border-t border-white/10 p-5">
            {/* Accounts now live in the database; there is no server-side
                self-delete endpoint yet, so this is disabled rather than
                faking deletion by clearing localStorage. */}
            <p className="text-sm text-white/60">
              Self-service account deletion isn&apos;t available yet. Contact support to delete your account.
            </p>
            <button
              type="button"
              disabled
              className="mt-5 w-full py-2.5 rounded-lg bg-white/5 border border-white/10 text-white/30 text-sm font-semibold cursor-not-allowed"
            >
              Delete Account
            </button>
          </div>
        )}
      </section>

      {/* Sign out */}
      <div className="mt-6">
        <button
          type="button"
          onClick={handleSignOut}
          className="w-full py-2.5 rounded-lg border border-red-400/20 text-red-400 text-sm font-semibold hover:bg-red-400/10 transition-colors"
        >
          Sign out
        </button>
      </div>
    </AccountShell>
  );
}
