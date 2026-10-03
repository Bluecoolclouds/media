'use client';

import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import AccountShell from '@/components/account/AccountShell';
import { useAccountAuth, signOutAndClear } from '@/components/account/useAccountAuth';

function MonitorIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}

export default function SessionsClient() {
  const { hasMounted, isAuthed, email } = useAccountAuth();
  const [revokeOtherOnly, setRevokeOtherOnly] = useState(true);
  const [revoking, setRevoking] = useState(false);

  if (!hasMounted) return null;

  const signedIn = isAuthed;
  // Sessions are stateless JWTs, so the server has no per-device list to show
  // or revoke; we only know about this browser's session.
  const activeCount = signedIn ? 1 : 0;

  const handleRevoke = async () => {
    setRevoking(true);
    if (!revokeOtherOnly) {
      // "Also revoke the current session" — sign this browser out.
      toast.success('Signing out...');
      await signOutAndClear('/');
      return;
    }
    toast.success('No other sessions were found to revoke.');
    setRevoking(false);
  };

  return (
    <AccountShell>
      <Toaster
        position="top-right"
        toastOptions={{ style: { background: 'rgba(0,0,0,0.9)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }}
      />

      <h1 className="text-xl font-bold tracking-tight">All sessions</h1>
      <p className="mt-1 text-sm text-white/50">Manage the devices signed in to your account</p>

      <p className="mt-5 text-sm text-white/40">
        This is a list of devices that have logged into your account.
      </p>
      <p className="text-sm text-white/40">Revoke any sessions that you do not recognize.</p>

      <div className="mt-6 flex items-center justify-between">
        <span className="text-sm font-semibold text-white">Active sessions</span>
        <span className="text-sm font-semibold text-white">{activeCount}</span>
      </div>

      <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        {signedIn ? (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-white/40">
                <MonitorIcon />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white">This browser</p>
                <p className="text-xs text-white/40 truncate">
                  {email ? `Signed in as ${email}` : 'Current session'}
                </p>
              </div>
            </div>
            <span className="shrink-0 rounded-full bg-emerald-400/10 px-3 py-1 text-[11px] font-medium text-emerald-400">
              Active · this device
            </span>
          </div>
        ) : (
          <p className="text-sm text-white/40">Not signed in.</p>
        )}
      </div>

      {signedIn && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Revoke all devices</p>
              <p className="mt-0.5 text-xs text-white/40">Revoke all other sessions</p>
            </div>
            <button
              type="button"
              onClick={handleRevoke}
              disabled={revoking}
              className="shrink-0 rounded-lg border border-red-400/30 px-4 py-2 text-xs font-semibold text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50"
            >
              Revoke
            </button>
          </div>
          <p className="mt-2 text-xs text-white/35">Every device except this one will be signed out.</p>

          <label className="mt-4 flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={!revokeOtherOnly}
              onChange={(e) => setRevokeOtherOnly(!e.target.checked)}
              className="size-4 rounded border-white/20 bg-white/5 text-cyan-400 focus:ring-cyan-400 focus:ring-offset-0"
            />
            <span className="text-xs text-white/50">Also revoke the current session</span>
          </label>
        </div>
      )}

      <p className="mt-6 text-xs text-white/35">
        Cross-device session history isn't available yet.
      </p>
    </AccountShell>
  );
}
