# Deployment Guide

## Quick Start

### Prerequisites

- **Node.js** 20.x or higher
- **npm** 10.x or higher (or pnpm/yarn)
- **Git**

### Environment Setup

```bash
# Clone the repository
git clone https://github.com/your-org/debt-optimize.git
cd debt-optimize

# Install dependencies
npm install

# Start development server
npm run dev
```

The development server will start at `http://localhost:5173`

---

## Build Commands

| Command | Description | Output |
|---------|-------------|--------|
| `npm run dev` | Start development server with HMR | `localhost:5173` |
| `npm run build` | Production build | `./dist/` |
| `npm run preview` | Preview production build locally | `localhost:4173` |
| `npm run lint` | Run ESLint | Terminal output |

---

## Production Build

The build process:

1. **TypeScript compilation** — Type-checks all `.ts` and `.tsx` files
2. **Vite bundling** — Tree-shakes dependencies, optimizes assets
3. **CSS processing** — Tailwind CSS v4 generates utility classes, LightningCSS minifies
4. **Asset optimization** — Images, fonts, and SVGs are optimized

```bash
npm run build
```

Output structure:

```
dist/
├── index.html              # Entry HTML file
├── assets/
│   ├── index-XXXXXX.js     # Bundled JavaScript
│   ├── index-XXXXXX.css    # Bundled CSS
│   └── ...                 # Other assets
└── favicon.svg
```

---

## Deployment Platforms

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Or connect your GitHub repository to Vercel for automatic deployments on push.

**`vercel.json` configuration:**

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

**`_redirects` file:**

```
/*    /index.html   200
```

### AWS S3 + CloudFront

```bash
# Build first
npm run build

# Sync to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

### Docker

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

```bash
# Build and run
docker build -t debt-optimize .
docker run -p 8080:80 debt-optimize
```

---

## Environment Variables

For the POC, all data is client-side. In production, these variables would be needed:

```bash
# .env.production
VITE_API_BASE_URL=https://api.debtoptimize.com
VITE_AUTH_DOMAIN=auth.debtoptimize.com
VITE_STRIPE_PUBLIC_KEY=pk_live_...
VITE_PLAID_CLIENT_ID=...
VITE_SENTRY_DSN=https://...
```

**Note:** All `VITE_` prefixed variables are exposed to the client. Never store secrets here.

---

## Performance Optimization

### Current Bundle Size

```
dist/assets/index-XXXXXX.js    ~800 KB (gzipped: ~237 KB)
dist/assets/index-XXXXXX.css    ~48 KB (gzipped: ~8.8 KB)
```

### Optimization Checklist

- [ ] Enable **gzip** or **brotli** compression on your web server
- [ ] Set **Cache-Control** headers for static assets:
  ```
  Cache-Control: public, max-age=31536000, immutable
  ```
- [ ] Use a **CDN** for global asset delivery
- [ ] Enable **HTTP/2** or **HTTP/3** on your server
- [ ] Add **preconnect** hints for external domains:
  ```html
  <link rel="preconnect" href="https://fonts.googleapis.com">
  ```

### Code Splitting (Future)

For production, implement route-based code splitting:

```typescript
// App.tsx
import { lazy, Suspense } from 'react';

const LandingPage = lazy(() => import('./components/LandingPage'));
const Onboarding = lazy(() => import('./components/Onboarding'));
const Dashboard = lazy(() => import('./components/Dashboard'));

// Wrap in Suspense with loading fallback
<Suspense fallback={<LoadingScreen />}>
  <Dashboard />
</Suspense>
```

---

## Domain & SSL

### Recommended DNS Setup

```
Type     Name              Value                  TTL
A        @                 76.76.21.21            3600
CNAME    www               cname.vercel-dns.com   3600
```

### SSL Certificate

- **Vercel/Netlify:** Auto-provisioned via Let's Encrypt
- **AWS:** Use AWS Certificate Manager (ACM)
- **Custom:** Certbot with Nginx

```bash
# Certbot example
sudo certbot --nginx -d debtoptimize.com -d www.debtoptimize.com
```

---

## Monitoring

### Recommended Tools

| Tool | Purpose | Integration |
|------|---------|-------------|
| **Sentry** | Error tracking | `npm install @sentry/react` |
| **Google Analytics 4** | User behavior | G-ID in `index.html` |
| **Hotjar** | Heatmaps & recordings | Script tag in `index.html` |
| **Vercel Analytics** | Web vitals | Built-in on Vercel |

### Sentry Setup

```typescript
// main.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampleRate: 0.1,
});
```

---

## Rollback Strategy

If a deployment causes issues:

```bash
# Vercel
vercel --prod --archive=previous

# Netlify
netlify deploy --prod --dir=dist --alias=rollback

# General: Use Git tags
 git tag -a v1.0.1 -m "Hotfix rollback"
 git checkout v1.0.1
 npm run build
 # Re-deploy
```

---

## Security Headers

Configure these headers on your web server:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

For Netlify, add to `netlify.toml`:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
```

---

## CI/CD Pipeline

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - run: npm run lint
      - name: Deploy to Vercel
        uses: vercel/action-deploy@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```
