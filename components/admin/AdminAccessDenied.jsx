'use client';

import { signOut } from 'next-auth/react';

/**
 * Shown on /admin when a logged-in user does not have the ADMIN role.
 */
export default function AdminAccessDenied({ email }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] px-4">
      <div className="w-full max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-bold text-white">Access denied</h1>
        <p className="text-gray-400">
          {email ? (
            <>
              <span className="text-white">{email}</span> is signed in, but this
              account does not have admin access.
            </>
          ) : (
            'This account does not have admin access.'
          )}
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <a
            href="/"
            className="py-2 px-4 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-all"
          >
            Back to home
          </a>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/admin' })}
            className="py-2 px-4 bg-cyan-500 text-black font-medium rounded-lg hover:bg-cyan-400 transition-all"
          >
            Sign in as another user
          </button>
        </div>
      </div>
    </div>
  );
}
