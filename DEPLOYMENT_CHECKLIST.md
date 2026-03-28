# NeuroOps Vercel Deployment — Quick Checklist

## ✅ Pre-Deployment Checklist

### Local Development (Done!)
- [x] Frontend built and tested locally
- [x] Backend API endpoints functional
- [x] 3D Premium dashboard running
- [x] All interactive features working

### Repository Setup
- [ ] Git initialized and files committed
- [ ] GitHub account created
- [ ] Repository created on GitHub.com
- [ ] Local repo pushed to GitHub

### Vercel Setup
- [ ] Vercel account created (https://vercel.com)
- [ ] Project imported from GitHub
- [ ] Environment variables configured
- [ ] Build settings verified

### Post-Deployment
- [ ] Production URL accessible
- [ ] API endpoints responding (/api/health)
- [ ] 3D dashboard loads correctly
- [ ] No console errors in browser
- [ ] Live metrics polling working

---

## 🚀 Quick Deploy Command

```bash
# One-time setup
npm run deploy

# Or step-by-step:
git push origin main
# Then visit https://vercel.com/new and import your GitHub repo
```

---

## 📊 Production URLs

Once deployed, access:

| Feature | URL |
|---------|-----|
| Premium 3D Dashboard | `https://your-project.vercel.app` |
| Standard 3D | `https://your-project.vercel.app/3d` |
| Legacy 2D | `https://your-project.vercel.app/legacy` |
| API Health | `https://your-project.vercel.app/api/health` |
| Services | `https://your-project.vercel.app/api/services` |
| Metrics | `https://your-project.vercel.app/api/metrics` |

---

## 🔧 Configuration

### API Endpoints
The app automatically detects deployment environment:
- **Local:** Uses `http://localhost:3001/api`
- **Vercel:** Uses `/api` (same domain)

### File Structure Required
```
frontend/
├── public/
│   ├── index-3d-premium.html ← Default
│   ├── app-3d-premium.js
│   ├── index-3d.html
│   └── index.html

api/
├── services.js
├── metrics.js
├── incidents.js
└── health.js

vercel.json
package.json
```

---

## 📈 Performance Metrics

After deployment, monitor:
- **TTFB:** < 500ms
- **Largest Contentful Paint:** < 2.5s
- **API Response Time:** < 200ms
- **Uptime:** 99.95%+

---

## 🆘 Troubleshooting

### "API is not responding"
1. Check `/api/health` endpoint
2. View logs in Vercel Dashboard
3. Verify API route files exist in `/api` folder

### "CORS errors in browser console"
1. Check API functions have CORS headers
2. Verify `Access-Control-Allow-Origin: *`

### "Old version still showing"
1. Hard refresh: `Ctrl+Shift+R` (Cmd+Shift+R on Mac)
2. Clear browser cache
3. Wait for Vercel deployment to complete

### "Building failed"
1. Visit Vercel Dashboard
2. Check "Deployments" → "Failed" for error message
3. Check logs for missing files or build errors

---

## 🎯 Next Steps

1. **[Deploy Now](https://vercel.com/new)** → Import from GitHub
2. **Share URL** → Your live dashboard link
3. **Add Domain** → (Optional) Custom domain setup
4. **Monitor** → Check Vercel Analytics dashboard
5. **Iterate** → Push changes to GitHub (auto-deploy)

---

**Version:** 4.0 Premium  
**Last Updated:** March 28, 2026  
**Status:** Production Ready ✅
