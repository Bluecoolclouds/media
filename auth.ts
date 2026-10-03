import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { authConfig } from './auth.config';
import { verifyPassword } from './lib/auth';
import { prisma } from './lib/prisma';
import { rateLimit, clientIp } from './lib/rateLimit';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  providers: [
    ...authConfig.providers,
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Brute-force guard: per IP and per account. Returning null shows the
        // generic "invalid credentials" error without revealing the lockout.
        const window = { limit: 10, windowMs: 15 * 60 * 1000 };
        const email = String(credentials.email).toLowerCase();
        const byIp = rateLimit(`login:ip:${clientIp(request.headers)}`, window);
        const byEmail = rateLimit(`login:email:${email}`, window);
        if (!byIp.allowed || !byEmail.allowed) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string,
          },
        });

        if (!user || !user.password) {
          return null;
        }

        const isValid = await verifyPassword(
          credentials.password as string,
          user.password
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role || 'USER',
        } as any;
      },
    }),
  ],
});
