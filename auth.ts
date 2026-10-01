import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { authConfig } from './auth.config';
import { verifyPassword } from './lib/auth';
import { prisma } from './lib/prisma';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  providers: [
    ...authConfig.providers.map((provider) => {
      if (provider.id === 'credentials') {
        return {
          ...provider,
          async authorize(credentials) {
            if (!credentials?.email || !credentials?.password) {
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
        };
      }
      return provider;
    }),
  ],
});
