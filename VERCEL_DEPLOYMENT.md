# NeuroOps Full-Stack Vercel Deployment Guide

## 🚀 Overview

This guide walks you through deploying NeuroOps as a complete full-stack application on Vercel.

## 📋 Prerequisites

1. **GitHub Account** — Required for Vercel integration
2. **Vercel Account** — Sign up at https://vercel.com (free tier available)
3. **Git installed** — For version control

## 🎯 Step 1: Prepare Your Repository

### 1.1 Initialize Git and Push to GitHub

```bash
# From project root directory
cd c:\Users\HP\OneDrive\Desktop\ddddd\NeuroOpus

# Initialize git repository
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: NeuroOps 3D Premium Dashboard"

# Create repository on GitHub.com, then add remote
git remote add origin https://github.com/YOUR_USERNAME/neuro-ops.git
git branch -M main
git push -u origin main
```

### 1.2 Project Structure

```
neuro-ops/
├── frontend/
│   └── public/
│       ├── index-3d-premium.html    ← Default landing page
│       ├── app-3d-premium.js        ← Premium 3D logic
│       ├── index-3d.html
│       ├── index.html
│       └── ... (assets)
├── api/                                 ← Vercel Serverless Functions
│   ├── services.js
│   ├── metrics.js
│   ├── incidents.js
│   └── health.js
├── vercel.json                          ← Vercel configuration
├── package.json                         ← Updated
└── .gitignore                           ← Version control config
```

## 🔌 Step 2: Connect Vercel to GitHub

### 2.1 Import Project to Vercel

1. Go to https://vercel.com/import
2. Select **"Import Git Repository"**
3. Paste your GitHub repo URL: `https://github.com/YOUR_USERNAME/neuro-ops`
4. Click **"Import"**

### 2.2 Configure Environment

**Project Settings:**
- **Framework Preset:** Other
- **Build Command:** (leave blank — using vercel.json)
- **Install Command:** `npm install`
- **Output Directory:** `frontend/public`

**Environment Variables** (Add these):
```
API_BASE=https://your-project.vercel.app/api
NODE_ENV=production
```

## ✅ Step 3: Deploy

### 3.1 Automatic Deployment

Once connected, Vercel will:
- Automatically deploy on every push to `main` branch
- Generate preview deployments for pull requests
- Run your build scripts

### 3.2 First Deployment

Click **"Deploy"** button. Your application will be live in ~2-3 minutes!

### 3.3 After Deployment

You'll receive:
- ✅ Production URL: `https://your-project.vercel.app`
- ✅ Git integration: Auto-deploy on push
- ✅ SSL certificate: Already configured

## 🔄 API Integration

The frontend automatically connects to the backend API:

```javascript
// api/app-3d-premium.js already configured for:
const API_BASE = `http://${API_HOST}:${API_PORT}/api`;
```

### API Endpoints Available

**On Vercel, all routes are automatically configured:**

- `GET /api/services` — Service list
- `GET /api/metrics` — Real-time metrics
- `GET /api/incidents` — Incident management
- `POST /api/incidents` — Create incidents
- `GET /api/health` — Health check

## 📊 Vercel Dashboard

After deployment, access:
- **Production URL:** https://your-project.vercel.app
- **Dashboard:** https://vercel.com/dashboard
- **Deployments:** View all production & preview deployments
- **Analytics:** Request count, error rates, latency
- **Logs:** Real-time function execution logs

## 🔍 Monitoring & Debugging

### View Logs

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# View live logs
vercel logs your-project-name
```

### Common Issues

**CORS Errors:**
- All API functions have CORS headers configured
- Verify `Access-Control-Allow-Origin: *` is set

**404 on Frontend:**
- vercel.json rewrites handle SPA routing
- Check that frontend files exist in `frontend/public/`

**API Not Responding:**
- Check `/api/health` endpoint
- View function logs in Vercel Dashboard

## 🆙 Updating Deployment

### Push Updates

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Vercel automatically redeploys within seconds!

### Manual Redeploy

From Vercel Dashboard → Your Project → Deployments → Click "..." menu → "Redeploy"

## 🎨 Custom Domain

1. In Vercel Dashboard → Project Settings → Domains
2. Add your custom domain (e.g., `neuro-ops.com`)
3. Update DNS records per Vercel's instructions
4. SSL auto-renews annually

## 📈 Performance

### Optimization Features

✓ Edge Caching for static assets (1 hour)
✓ API functions auto-scale
✓ Automatic CDN distribution
✓ Serverless function cold start: ~100ms
✓ Production monitoring included

### Analytics

Access in Dashboard:
- Request count by endpoint
- Response times (p50, p95, p99)
- Error rates by path
- Top deployment changes

## 🔐 Security

✓ SSL/TLS enabled by default
✓ CORS properly configured
✓ Environment variables secured
✓ Vercel WAF (Web Application Firewall)
✓ DDoS protection included

## 💾 Database (Optional)

For production data persistence, add:
- **PostgreSQL:** Vercel Postgres (beta)
- **MongoDB:** MongoDB Atlas
- **Redis:** Upstash Redis

Update your API functions to use real database instead of in-memory storage.

## 📞 Support

- **Vercel Docs:** https://vercel.com/docs
- **Vercel Support:** https://vercel.com/support
- **GitHub Issues:** Create issue in your repo

## 🎯 Next Steps

1. ✅ Push to GitHub
2. ✅ Import to Vercel
3. ✅ Deploy
4. ✅ Share your live dashboard URL!
5. ✅ Add custom domain
6. ✅ Configure database (optional)

---

**Deployment URL:** Will be provided after step 2

**Version:** 4.0 Premium  
**Last Updated:** March 28, 2026  
**Status:** Ready for Production
