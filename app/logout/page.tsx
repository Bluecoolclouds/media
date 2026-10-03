'use client';

import { useEffect } from 'react';
import { signOutAndClear } from '@/components/account/useAccountAuth';

export default function LogoutPage() {
  useEffect(() => {
    // Ends the NextAuth session and wipes legacy localStorage auth keys.
    signOutAndClear('/login');
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505]">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Logging out...</h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto"></div>
      </div>
    </div>
  );
}
