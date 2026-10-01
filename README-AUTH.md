# NextAuth.js v5 Authentication Setup

This project uses NextAuth.js v5 (beta) for authentication with support for Credentials, Google, and GitHub providers.

## Initial Setup

### 1. Install Dependencies

Dependencies are already installed:
- `next-auth@beta` - NextAuth.js v5
- `@auth/prisma-adapter` - Prisma adapter for NextAuth
- `@prisma/client` - Prisma client
- `bcryptjs` - Password hashing
- `@types/bcryptjs` - TypeScript types

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

Required variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=  # Generate with: openssl rand -base64 32

# Google OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# GitHub OAuth (optional)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

### 3. Set Up Database

Initialize Prisma and create the database tables:

```bash
npx prisma generate
npx prisma db push
```

Or if you prefer migrations:

```bash
npx prisma migrate dev --name init
```

## OAuth Provider Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret to `.env`

### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Client Secret to `.env`

## Project Structure

```
├── auth.config.ts                 # NextAuth configuration
├── auth.ts                        # NextAuth setup with Prisma adapter
├── middleware.ts                  # Route protection middleware
├── lib/
│   ├── auth.ts                    # Auth utility functions
│   └── prisma.ts                  # Prisma client singleton
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── [...nextauth]/
│   │       │   └── route.ts       # NextAuth API route
│   │       └── register/
│   │           └── route.ts       # Registration endpoint
│   ├── login/
│   │   └── page.tsx               # Login page
│   └── register/
│       └── page.tsx               # Registration page
├── components/
│   └── auth/
│       ├── LoginForm.tsx          # Login form component
│       ├── RegisterForm.tsx       # Registration form component
│       ├── UserMenu.tsx           # User dropdown menu
│       └── SessionProvider.tsx    # Session provider wrapper
├── prisma/
│   └── schema.prisma              # Database schema
└── types/
    └── next-auth.d.ts             # TypeScript type extensions
```

## Usage

### Protect Routes with Middleware

The `middleware.ts` file automatically protects `/admin/*` routes. Customize the matcher in `middleware.ts`:

```typescript
export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    // Add more protected routes
  ],
};
```

### Server-Side Authentication

Use the utility functions in `lib/auth.ts`:

```typescript
import { getSession, requireAuth, requireAdmin } from '@/lib/auth';

// Get current session (nullable)
const session = await getSession();

// Require authentication (throws if not logged in)
const user = await requireAuth();

// Require admin role (throws if not admin)
const admin = await requireAdmin();
```

### Client-Side Authentication

Use the `useSession` hook from `next-auth/react`:

```typescript
'use client';

import { useSession } from 'next-auth/react';

export default function MyComponent() {
  const { data: session, status } = useSession();
  
  if (status === 'loading') return <div>Loading...</div>;
  if (!session) return <div>Not authenticated</div>;
  
  return <div>Hello, {session.user.name}!</div>;
}
```

### Add Session Provider to Layout

Wrap your app with the SessionProvider:

```typescript
import { SessionProvider } from '@/components/auth/SessionProvider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
```

### Password Utilities

```typescript
import { hashPassword, verifyPassword } from '@/lib/auth';

// Hash a password
const hashed = await hashPassword('password123');

// Verify a password
const isValid = await verifyPassword('password123', hashed);
```

## User Roles

The system supports role-based access control. Default roles:
- `user` - Standard user (default)
- `admin` - Administrator with full access

To create an admin user, manually update the database:

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

Or use Prisma Studio:

```bash
npx prisma studio
```

## API Routes

### POST `/api/auth/register`

Register a new user with credentials.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "..."
  },
  "message": "User created successfully"
}
```

## Security Best Practices

1. **Never commit `.env`** - Contains sensitive credentials
2. **Use strong secrets** - Generate `NEXTAUTH_SECRET` with: `openssl rand -base64 32`
3. **HTTPS in production** - Always use HTTPS for OAuth callbacks
4. **Password requirements** - Minimum 8 characters enforced
5. **Rate limiting** - Consider adding rate limiting to auth endpoints
6. **Email verification** - Consider adding email verification for new users

## Troubleshooting

### Prisma Client Not Generated

```bash
npx prisma generate
```

### Database Connection Issues

- Check `DATABASE_URL` in `.env`
- Ensure database server is running
- Verify connection credentials

### OAuth Redirect Errors

- Verify callback URLs match exactly
- Check `NEXTAUTH_URL` is set correctly
- Ensure OAuth app is not in development mode (for production)

### Session Not Persisting

- Verify `NEXTAUTH_SECRET` is set
- Check cookie settings in browser
- Clear browser cookies and try again

## Additional Resources

- [NextAuth.js v5 Documentation](https://authjs.dev/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [NextAuth.js GitHub](https://github.com/nextauthjs/next-auth)
