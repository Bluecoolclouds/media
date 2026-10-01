# Production Deployment Guide - Admin Subdomain Setup

## 🎯 Overview

This guide will help you deploy Open Generative AI with a secure admin subdomain setup:
- `yoursite.com` - Main application (Studio, Generation, Public pages)
- `admin.yoursite.com` - Admin panel (Dashboard, Models, Users management)

---

## 📋 Prerequisites

1. Domain name registered (e.g., `yoursite.com`)
2. Hosting platform account (Vercel/Cloudflare/AWS)
3. PostgreSQL database
4. Environment variables configured

---

## 🚀 Deployment Options

### Option 1: Vercel (Recommended - Easiest)

**Step 1: Configure DNS**
```
A Record:
  Name: admin
  Value: 76.76.21.21 (Vercel IP)
  
CNAME (alternative):
  Name: admin
  Value: cname.vercel-dns.com
```

**Step 2: Update `next.config.mjs`**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['studio', 'ai-agent', 'workflow-builder', 'design-agent'],
  
  // Multi-domain configuration
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
        ],
      },
    ]
  },
};

export default nextConfig;
```

**Step 3: Configure Vercel Project**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Add domains in Vercel dashboard:
# 1. yoursite.com (main)
# 2. admin.yoursite.com (admin)
```

**Step 4: Update Middleware**
Create `middleware.production.ts`:
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  
  // Admin subdomain
  if (hostname.startsWith('admin.')) {
    // Only allow /admin routes
    if (!request.nextUrl.pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    
    // Check admin authentication
    // Your auth logic here
  }
  
  // Main domain - block /admin access
  if (!hostname.startsWith('admin.') && request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

**Step 5: Environment Variables**
Add to Vercel:
```bash
DATABASE_URL=postgresql://...
AUTH_SECRET=your-secret
NEXTAUTH_URL=https://yoursite.com
ADMIN_URL=https://admin.yoursite.com
NODE_ENV=production
```

**Step 6: Deploy**
```bash
vercel --prod
```

---

### Option 2: Cloudflare Pages

**Step 1: DNS Configuration**
```
In Cloudflare Dashboard:
1. Add A record: admin → Your server IP
2. Enable Cloudflare proxy (orange cloud)
```

**Step 2: Create `wrangler.toml`**
```toml
name = "open-generative-ai"
compatibility_date = "2024-01-01"

[env.production]
routes = [
  { pattern = "yoursite.com/*", zone_name = "yoursite.com" },
  { pattern = "admin.yoursite.com/*", zone_name = "yoursite.com" }
]

[[env.production.routes]]
pattern = "admin.yoursite.com/*"
custom_domain = true
```

**Step 3: Deploy**
```bash
# Install Wrangler
npm install -g wrangler

# Login
wrangler login

# Deploy
npm run build
wrangler pages deploy ./out
```

---

### Option 3: Self-Hosted (Nginx + Docker)

**Step 1: DNS Configuration**
```
A Record:
  Name: @
  Value: YOUR_SERVER_IP
  
A Record:
  Name: admin
  Value: YOUR_SERVER_IP
```

**Step 2: Create `nginx.conf`**
```nginx
# Main site
server {
    listen 80;
    server_name yoursite.com www.yoursite.com;
    
    # Block /admin on main domain
    location /admin {
        return 403;
    }
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Admin subdomain
server {
    listen 80;
    server_name admin.yoursite.com;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=admin_limit:10m rate=10r/m;
    limit_req zone=admin_limit burst=5;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Step 3: SSL with Let's Encrypt**
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificates
sudo certbot --nginx -d yoursite.com -d www.yoursite.com
sudo certbot --nginx -d admin.yoursite.com

# Auto-renewal
sudo certbot renew --dry-run
```

**Step 4: Docker Compose**
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/openai
      - NEXTAUTH_URL=https://yoursite.com
      - ADMIN_URL=https://admin.yoursite.com
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: openai
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: your-password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - /etc/letsencrypt:/etc/letsencrypt
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
```

**Step 5: Deploy**
```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## 🔐 Security Checklist

Before going to production:

- [ ] SSL certificates installed (HTTPS)
- [ ] Environment variables secured (not in code)
- [ ] Database backups configured
- [ ] Rate limiting enabled
- [ ] Admin session timeout: 30 minutes
- [ ] Audit logs enabled
- [ ] Strong passwords enforced
- [ ] 2FA enabled for admins
- [ ] CORS configured properly
- [ ] Security headers added
- [ ] Regular security updates scheduled

---

## 📊 Monitoring Setup

**Add to `middleware.ts`:**
```typescript
// Log admin access
if (hostname.startsWith('admin.')) {
  console.log(`[ADMIN ACCESS] ${request.method} ${request.url} - IP: ${request.ip}`);
}
```

**Recommended monitoring tools:**
- Vercel Analytics (built-in)
- Sentry (error tracking)
- LogRocket (session replay)
- Uptime Robot (uptime monitoring)

---

## 🧪 Testing Before Production

**Local subdomain testing:**

1. Edit `/etc/hosts` (Mac/Linux) or `C:\Windows\System32\drivers\etc\hosts` (Windows):
```
127.0.0.1 admin.localhost
127.0.0.1 localhost
```

2. Update `middleware.ts` to check for `admin.localhost`

3. Test:
```bash
npm run dev

# Visit:
http://localhost:3000        # Main app
http://admin.localhost:3000  # Admin panel
```

---

## 📝 Post-Deployment

1. **Test all functionality:**
   - Login/Register
   - Admin panel access
   - CRUD operations
   - File uploads
   - API endpoints

2. **Monitor for 24 hours:**
   - Check error logs
   - Monitor database queries
   - Watch for failed logins

3. **Setup backups:**
   - Database: Daily automated backups
   - File storage: Weekly backups
   - Code: Git tags for releases

---

## 🆘 Troubleshooting

**Issue: Admin subdomain not resolving**
```bash
# Check DNS propagation
dig admin.yoursite.com

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

**Issue: Middleware not working**
```bash
# Check Next.js logs
vercel logs

# Verify middleware config
console.log('Hostname:', request.headers.get('host'));
```

**Issue: 502 Bad Gateway**
```bash
# Check app is running
docker-compose ps

# Check app logs
docker-compose logs app

# Restart services
docker-compose restart
```

---

## 📞 Support

If you need help during deployment:
1. Check Next.js docs: https://nextjs.org/docs
2. Check Vercel docs: https://vercel.com/docs
3. GitHub Issues: [Your repo]/issues

---

**Ready to deploy?** Follow the guide for your chosen platform! 🚀
