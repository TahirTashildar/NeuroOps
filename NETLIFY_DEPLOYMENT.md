# NeuroOps Netlify Deployment Guide

## ✅ Fix Applied

**Problem**: Netlify was looking for `frontend/dist` but it doesn't exist (static site, no build needed)

**Solution**: Created `netlify.toml` to publish `frontend/public` instead

---

## 📋 What Changed

### Files Modified

1. **netlify.toml** (NEW)
   - Sets publish directory to `frontend/public`
   - Configures SPA redirects
   - Sets cache control headers

2. **package.json** (UPDATED)
   - Simplified build script (now generic)
   - Added `build:vercel` for Vercel-specific deployment

---

## 🚀 Deploy to Netlify Now

### Step 1: Update Netlify Configuration
In Netlify UI, set:
- **Build command**: `npm run build`
- **Publish directory**: `frontend/public`

OR just push the code and Netlify will auto-read `netlify.toml`

### Step 2: Push Code to GitHub
```bash
git add .
git commit -m "Fix Netlify deployment: Add netlify.toml with static site config"
git push origin main
```

### Step 3: Redeploy on Netlify
1. Go to https://app.netlify.com
2. Select your NeuroOps site
3. Click "Trigger deploy" → "Deploy site"

**Expected result**:
```
✓ Build command ran successfully
✓ Published: frontend/public
✓ Site is live!
```

---

## 📁 Directory Structure

```
NeuroOpus/
├── frontend/
│   └── public/              ← Published to Netlify
│       ├── index.html       ← Main entry
│       ├── index-3d.html    ← 3D dashboard
│       ├── index-3d-premium.html
│       ├── app-3d.js        ← 3D app
│       ├── app.js           ← Legacy app
│       ├── app-3d-premium.js
│       └── theme-highend.css
├── netlify.toml             ← Netlify config (NEW)
└── package.json             ← Root config (UPDATED)
```

---

## 🔧 netlify.toml Configuration

```toml
[build]
  # No build needed - static site
  command = "echo 'Static site deployment'"
  publish = "frontend/public"

# Serve index.html for all routes (SPA support)
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Cache control
[[headers]]
  for = "/app-3d.js"
  [headers.values]
    Cache-Control = "public, max-age=86400"
```

---

## 📊 Deployment Options

### Option A: Netlify Connected to GitHub (Recommended)
1. Connect repo to Netlify
2. Netlify reads `netlify.toml`
3. Auto-deploys on every push to main

### Option B: Netlify CLI
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=frontend/public
```

### Option C: Manual Site Link
```bash
netlify sites:create --name neuro-ops-dashboard
netlify deploy --prod --dir=frontend/public --site-id=<your-site-id>
```

---

## ✅ Verification Checklist

- [x] `netlify.toml` created with `frontend/public`
- [x] `package.json` build script simplified
- [x] `frontend/public` contains all files
- [x] Ready to deploy

---

## 🆘 Troubleshooting

### Build Still Fails?
1. Clear Netlify cache:
   - Netlify UI → Site Settings → Build → Clear cache
2. Re-trigger deploy:
   - Netlify UI → Deployments → Trigger deploy

### Site Shows Blank Page?
- Make sure `index.html` loads at root
- Check browser console for errors
- Verify `app-3d.js` loads correctly

### Redirects Not Working?
- Netlify SPA redirect configured in `netlify.toml`
- Check `[[redirects]]` section

### API Connection Issues?
- Set `VITE_API_URL` environment variable in Netlify UI
- Must point to live API (Railway or your backend)

---

## 🌐 Environment Variables

Set in Netlify UI → Site Settings → Build & Deploy → Environment:

```env
# API endpoint
VITE_API_URL=https://your-api-domain.com

# Optional
NODE_ENV=production
```

---

## 📈 Performance Tips

- Cache CSS/JS files for 1 day
- Cache index.html with must-revalidate
- 3D assets load dynamically
- Minification handled by Three.js

---

## 🔗 Live Deployment

After deploying, your site will be at:
```
https://<your-site-name>.netlify.app
```

---

## 🎯 Next Steps

1. ✅ Push fixed code to GitHub
2. ✅ Trigger Netlify redeploy
3. ✅ Verify site loads at netlify.app URL
4. ✅ Test 3D dashboard features
5. ✅ Monitor API connectivity

---

**Status**: ✅ Ready for Netlify Deployment!
