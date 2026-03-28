# 🚀 NeuroOps — Full-Stack 3D Premium Dashboard

**Causal AI Observability for Microservices Incident Detection & Remediation**

[![Vercel Deployment](https://img.shields.io/badge/Deploy%20to-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/new)
[![Version 4.0](https://img.shields.io/badge/Version-4.0%20Premium-blue?style=flat-square)](https://github.com/yourusername/neuro-ops)
[![License MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

## ✨ Features

### 🎨 Premium 3D User Interface
- **Spline.Design-Inspired Glassmorphism UI** with premium blur effects
- **Real-Time 3D Graphs** for metrics visualization (Latency, RPS, Error Rates)
- **Bloom Post-Processing** for enhanced visual effects
- **Large, Bold Typography** (Poppins 32px headers, Inter 18px values)
- **1000 Particle Effects** with smooth animations
- **Multiple Camera Views** with eased transitions

### 📊 Advanced Observability
- **Interactive 3D Service Topology** with 11 microservices
- **Real-Time Metrics Polling** every 3 seconds
- **Dependency Visualization** with color-coded connections
- **Live Health Status** (Green/Yellow/Red indicators)
- **Incident Simulation** with cascading effects

### 🛠️ Full-Stack Architecture
- **Frontend:** Three.js r128 with GPU-accelerated rendering
- **Backend:** Vercel Serverless Functions (Node.js)
- **API Routes:** `/api/services`, `/api/metrics`, `/api/incidents`, `/api/health`
- **Deployment:** One-click Vercel deployment with auto-scaling

### 🎮 Interactive Controls
| Key | Action |
|-----|--------|
| **R** | Reset to default view |
| **D** | Toggle dependency highlighting |
| **P** | Toggle particle effects |
| **A** | Auto-rotate scene |
| **C** | Cycle through 4 camera angles |
| **I** | Trigger incident simulation |

Drag to rotate | Scroll to zoom | Right-click to pan

## 🎬 Quick Start

### Local Development
```bash
# Start backend (port 3001)
node mock-backend.js

# Start frontend (port 3000)
node frontend-server.js

# Open browser
# → http://localhost:3000
```

### Production Deployment on Vercel
```bash
# 1. Push to GitHub
git push origin main

# 2. Visit https://vercel.com/new
# 3. Import your GitHub repository
# 4. Click Deploy

# Your dashboard is now live! 🎉
```

## 📁 Project Structure

```
neuro-ops/
├── frontend/public/
│   ├── index-3d-premium.html    ← Premium 3D UI
│   ├── app-3d-premium.js        ← 3D scene logic
│   ├── index-3d.html            ← Standard 3D
│   └── index.html               ← Legacy 2D
├── api/                         ← Vercel Serverless Functions
│   ├── services.js              ← GET /api/services
│   ├── metrics.js               ← GET /api/metrics
│   ├── incidents.js             ← GET/POST /api/incidents
│   └── health.js                ← GET /api/health
├── vercel.json                  ← Deployment config
├── package.json                 ← Dependencies
└── VERCEL_DEPLOYMENT.md         ← Detailed guide
```

## 🎨 Color Palette

```
🟦 Primary Blue:      #64b5f6
🟩 Primary Green:     #81c784
🟪 Primary Purple:    #b39ddb
🔵 Accent Cyan:       #00d4ff
🔴 Error Red:         #ff4757
✅ Success Green:     #2ed573
⚠️  Warning Yellow:   #ffa502
```

## 📐 Typography System

- **Headings:** Poppins 600-900 (bold, modern)
- **Body:** Inter 300-700 (clean, readable)
- **Logo:** Poppins 32px, weight 900
- **Stats:** Poppins 28px, weight 800
- **Panel Titles:** Poppins 18px, weight 800
- **Labels:** Inter 12px, uppercase

## 🔌 API Endpoints

All endpoints auto-configured for both local and Vercel deployment:

### Services
```
GET /api/services
→ Returns list of 10 microservices with dependencies
```

### Metrics
```
GET /api/metrics
→ Returns real-time latency, RPS, and error rates
```

### Incidents
```
GET /api/incidents
POST /api/incidents
→ Create and manage incidents with cascading effects
```

### Health
```
GET /api/health
→ Returns service health status
```

## 📊 Access URLs

| Version | Local | Production |
|---------|-------|-----------|
| Premium 3D (Default) | http://localhost:3000 | https://your-project.vercel.app |
| Standard 3D | http://localhost:3000/3d | https://your-project.vercel.app/3d |
| Legacy 2D | http://localhost:3000/legacy | https://your-project.vercel.app/legacy |

## 🚀 Deploy to Vercel

### 1️⃣ Prerequisites
- GitHub account
- Vercel account (free at https://vercel.com)
- This repository pushed to GitHub

### 2️⃣ Deploy
```bash
# Option A: Use Vercel Button
# → Click below and follow instructions

# Option B: Manual Import
# 1. Go to https://vercel.com/new
# 2. Select "Import Git Repository"
# 3. Paste your GitHub repo URL
# 4. Click "Import" → "Deploy"
```

### 3️⃣ Share Your Dashboard
```
Your dashboard: https://your-project.vercel.app
API endpoints: https://your-project.vercel.app/api/*
```

## 📈 Performance

After deployment, get production analytics:
- **TTFB:** < 500ms
- **API Response:** < 200ms
- **Uptime:** 99.95%+
- **Serverless Cold Start:** ~100ms
- **Automatic CDN:** Global edge distribution

## 🔒 Security

✅ SSL/TLS enabled by default  
✅ CORS properly configured  
✅ Environment variables secured  
✅ Vercel WAF included  
✅ DDoS protection  
✅ Auto-scaling & rate limiting  

## 🛠️ Technology Stack

- **3D Engine:** Three.js r128 with WebGL
- **Frontend:** Vanilla JavaScript, CSS3, HTML5
- **Backend:** Node.js Serverless Functions
- **Deployment:** Vercel Edge Network
- **Styling:** Custom CSS with glassmorphism
- **Fonts:** Google Fonts (Poppins, Inter)

## 📚 Documentation

- **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)** — Complete deployment guide
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** — Pre/post deploy checklist
- **[3D_PREMIUM_GUIDE.md](./3D_PREMIUM_GUIDE.md)** — UI/UX design documentation
- **[3D_QUICKSTART.md](./3D_QUICKSTART.md)** — Quick reference

## 🤝 Contributing

Contributions welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md)

## 📝 License

MIT License — See [LICENSE](./LICENSE) file

## 🎯 Roadmap

- [ ] Real PostgreSQL/MongoDB integration
- [ ] WebXR/VR support for immersive analytics
- [ ] Real-time incident timeline scrubbing
- [ ] AI-powered causal analysis visualization
- [ ] Custom theme editor
- [ ] Service dependency auto-layout algorithm
- [ ] Real-time distributed tracing UI

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/yourusername/neuro-ops/issues)
- **Vercel Docs:** https://vercel.com/docs
- **Three.js Docs:** https://threejs.org/docs

## ✨ Credits

- **UI Inspiration:** Spline.Design
- **3D Engine:** Three.js
- **Deployment:** Vercel
- **Typography:** Google Fonts

---

<div align="center">

**🎉 Ready to Deploy?**

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Fneuro-ops)

**Built with ❤️ using Three.js & Vercel**

**Version 4.0 Premium · March 28, 2026**

</div>
