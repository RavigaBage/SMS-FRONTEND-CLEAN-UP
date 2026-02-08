# Production Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Variables
- [ ] Copy `.env.example` to `.env.production`
- [ ] Set `NEXT_PUBLIC_API_URL` to production API URL
- [ ] Set `NEXT_PUBLIC_SITE_URL` to production site URL
- [ ] Generate secure `NEXTAUTH_SECRET`: `openssl rand -base64 32`
- [ ] Configure any third-party services (analytics, error tracking)

### 2. Security
- [ ] Remove all `console.log` statements (handled by build)
- [ ] Review and update CSP headers in `next.config.ts`
- [ ] Ensure all API endpoints use HTTPS
- [ ] Enable rate limiting on backend
- [ ] Set up CORS properly on backend
- [ ] Review authentication token expiration times

### 3. Performance
- [ ] Run `npm run build` to test production build locally
- [ ] Check bundle size: `npm run analyze`
- [ ] Optimize images (use Next.js Image component)
- [ ] Review and remove unused dependencies
- [ ] Enable CDN for static assets

### 4. Code Quality
- [ ] Run `npm run lint` and fix all errors
- [ ] Run `npm run type-check` to ensure TypeScript types are correct
- [ ] Run `npm run format:check` to verify code formatting
- [ ] Review all TODO and FIXME comments

### 5. Testing
- [ ] Test all critical user flows
- [ ] Test authentication and authorization
- [ ] Test on different browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test on mobile devices
- [ ] Test error handling and edge cases

## Installation Steps

### 1. Install Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Install Production Dependencies
```bash
npm install --production
```

## Build Process

### Development
```bash
npm run dev
```

### Production Build
```bash
# Build the application
npm run build

# Start production server
npm run start
```

## Deployment Options

### Option 1: Vercel (Recommended for Next.js)
1. Push code to GitHub/GitLab/Bitbucket
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### Option 2: Docker
```dockerfile
# Dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

Build and run:
```bash
docker build -t school-management-system .
docker run -p 3000:3000 school-management-system
```

### Option 3: Traditional Server (PM2)
```bash
# Install PM2 globally
npm install -g pm2

# Build the application
npm run build

# Start with PM2
pm2 start npm --name "school-management" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### Option 4: Nginx Reverse Proxy
```nginx
server {
    listen 80;
    server_name yourdomain.com;

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

## Post-Deployment

### 1. Monitoring
- [ ] Set up error tracking (Sentry, LogRocket)
- [ ] Set up performance monitoring
- [ ] Set up uptime monitoring
- [ ] Configure logging

### 2. SSL/TLS
- [ ] Install SSL certificate (Let's Encrypt recommended)
- [ ] Force HTTPS redirects
- [ ] Enable HSTS

### 3. Backups
- [ ] Set up automated database backups
- [ ] Test backup restoration process
- [ ] Document backup procedures

### 4. Performance Optimization
- [ ] Enable HTTP/2
- [ ] Enable Brotli/Gzip compression
- [ ] Set up CDN (Cloudflare, AWS CloudFront)
- [ ] Configure caching headers
- [ ] Optimize database queries

### 5. Security Hardening
- [ ] Set up Web Application Firewall (WAF)
- [ ] Configure rate limiting
- [ ] Enable DDoS protection
- [ ] Regular security audits
- [ ] Keep dependencies updated

## Environment-Specific Configurations

### Development
```env
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Staging
```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://staging-api.yourdomain.com/api
NEXT_PUBLIC_SITE_URL=https://staging.yourdomain.com
```

### Production
```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-production-secret
```

## Troubleshooting

### Build Fails
1. Clear cache: `rm -rf .next node_modules`
2. Reinstall: `npm install`
3. Check Node version: `node -v` (should be >=18.17.0)

### Performance Issues
1. Check bundle size: `npm run analyze`
2. Review dynamic imports
3. Optimize images
4. Enable caching

### Memory Issues
1. Increase Node memory: `NODE_OPTIONS="--max-old-space-size=4096" npm run build`
2. Review large dependencies
3. Optimize build process

## Maintenance

### Regular Tasks
- [ ] Weekly: Review error logs
- [ ] Monthly: Update dependencies
- [ ] Monthly: Security audit
- [ ] Quarterly: Performance review
- [ ] Quarterly: Backup restoration test

### Dependency Updates
```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Update major versions (careful!)
npx npm-check-updates -u
npm install
```

## Support

For issues or questions:
1. Check documentation
2. Review error logs
3. Contact development team

---

**Last Updated:** 2026-02-08