# ⚡ NeuroOps Deployment Quick Reference Card

## 🎯 30-Second Deployment

```bash
# 1. Commit & Push
git add .
git commit -m "Deploy NeuroOps"
git push origin main

# 2. Visit Vercel
https://vercel.com/new

# 3. Import GitHub Repo
# 4. Click "Deploy"
# 5. Get your live URL
```

---

## 📋 Deployment Steps

1. **GitHub Setup**
   - Go to https://github.com/new
   - Create repo "neuro-ops"
   - Copy URL

2. **Git Push**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin [YOUR_GITHUB_URL]
   git push -u origin main
   ```

3. **Vercel Deploy**
   - Visit https://vercel.com/new
   - Click "Import Git Repository"
   - Paste GitHub URL
   - Click "Deploy"

4. **Live!**
   - Your URL: `https://your-project-name.vercel.app`

---

## 📱 Local Testing First

```bash
# Terminal 1
node mock-backend.js

# Terminal 2
node frontend-server.js

# Browser
http://localhost:3000
```

---

## 🎮 Keyboard Controls

| Key | Action |
|-----|--------|
| R | Reset |
| D | Dependencies |
| P | Particles |
| A | Auto-rotate |
| C | Camera |
| I | Incident |
| Drag | Rotate |
| Scroll | Zoom |

---

## 🔗 Important URLs

| Link | Purpose |
|------|---------|
| https://vercel.com/new | Deploy |
| https://github.com/new | Create repo |
| https://vercel.com/dashboard | Dashboard |
| http://localhost:3000 | Local test |

---

## ✅ Post-Deploy Verification

- [ ] Dashboard loads
- [ ] 3D graphs visible
- [ ] Real-time metrics updating
- [ ] `/api/health` responds
- [ ] No console errors
- [ ] Keyboard controls work

---

## 📝 API Endpoints

```
/api/services    → Service list
/api/metrics     → Real-time data
/api/incidents   → Incidents
/api/health      → Status
```

---

## 🆘 Quick Fixes

| Issue | Fix |
|-------|-----|
| Blank screen | Ctrl+Shift+R (hard refresh) |
| API not responding | Check /api/health |
| Old version showing | Clear browser cache |
| Build failed | Check Vercel logs |

---

## 📚 Documentation

- **GETTING_STARTED.md** ← Start here
- **VERCEL_DEPLOYMENT.md** ← Complete guide (200+ lines)
- **DEPLOYMENT_CHECKLIST.md** ← Verification steps
- **VERCEL_README.md** ← Project overview

---

## 🚀 Commands

```bash
# Setup
git init
git add .
git commit -m "Deploy"

# Push
git remote add origin [URL]
git push -u origin main

# Local test
npm start
node mock-backend.js

# Deploy
# Visit https://vercel.com/new
```

---

## 💡 Key Facts

- **Deployment Time:** 3-5 minutes
- **Performance:** < 500ms TTFB
- **Uptime:** 99.95%
- **Cost:** Free tier + $20-25/mo when scaled
- **Auto-scaling:** Yes, unlimited
- **CDN:** 300+ edge locations
- **Security:** SSL/TLS included

---

## 🎯 Success Checklist

- [ ] Code committed to GitHub
- [ ] GitHub URL logged
- [ ] Vercel account created
- [ ] Project imported to Vercel
- [ ] Deployment initiated
- [ ] Waiting for build (2-3 min)
- [ ] Live URL received
- [ ] Dashboard tested
- [ ] API endpoints verified
- [ ] Team notified

---

## 📞 Need Help?

1. **VERCEL_DEPLOYMENT.md** - Detailed guide
2. **https://vercel.com/docs** - Vercel docs
3. **Browser console** - Check for errors (F12)
4. **Vercel Dashboard** - View logs

---

<div align="center">

**⏱️ From Code → Live in 5 Minutes**

**🚀 [Deploy Now](https://vercel.com/new)**

</div>
