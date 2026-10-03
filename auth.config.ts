import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';

// Note: The Credentials provider is defined directly in auth.ts, not here.
// Auth.js merges each provider's original `options` over its top-level fields
// at runtime, so overriding `authorize` on a copy of a provider created here
// (e.g. via `authConfig.providers.map(...)`) is silently discarded. Keep
// providers that need Node-only dependencies (Prisma, bcrypt) out of this config.
export const authConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');

      if (isOnAdmin) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      }

      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user.role as 'USER' | 'ADMIN') || 'USER';
      }

      // Handle session updates
      if (trigger === 'update' && session) {
        token = { ...token, ...session };
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as 'USER' | 'ADMIN') || 'USER';
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
