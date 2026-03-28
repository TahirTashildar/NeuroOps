# 🚀 NeuroOps 3D Dashboard - Live Server Guide

## Quick Start

### Option 1: Using npm (Recommended)
```bash
npm start
```

### Option 2: Using node directly
```bash
node start-servers.js
```

### Option 3: Start servers separately
```bash
# Terminal 1 - Backend API (port 3001)
node mock-backend.js

# Terminal 2 - Frontend Server (port 3000)
node frontend-server.js
```

---

## What Happens When You Start

### Backend Server (Port 3001)
```
✓ Mock API server starts
✓ Endpoints available:
  - GET /health              → Health check
  - GET /api/services        → List all services
  - GET /api/metrics         → Real-time metrics
  - GET /api/incidents       → List incidents
  - POST /api/incidents      → Create incident
  - GET /api/logs            → System logs
  - POST /api/assistant      → AI chatbot
```

### Frontend Server (Port 3000)
```
✓ 3D Dashboard loads
✓ Automatically connects to backend
✓ Fetches live service & metric data
✓ Starts polling for updates (every 3 seconds)
```

---

## Access the Dashboard

### 🌐 Main URL
```
http://localhost:3000
```

### 📊 API Documentation
```
http://localhost:3001
```

---

## Live Features

### Real-Time Data Integration
- **Metrics**: Latency, RPS, Error Rate updates every 3 seconds
- **Services**: Live service status from backend
- **Incidents**: Create, view, and manage incidents
- **Fallback**: Uses mock data if backend unavailable

### Interaction Workflow
1. **Open Dashboard**: http://localhost:3000
2. **View 3D Scene**: Service topology renders instantly
3. **Trigger Incident**: Click `⚠️ Trigger Incident` button
4. **Watch Updates**: Metrics update in real-time
5. **Inspect Service**: Click any node for details

---

## Server Architecture

```
┌─────────────────────────────────────────────────┐
│          NeuroOps 3D Dashboard                   │
├─────────────────────────────────────────────────┤
│                                                  │
│  Frontend Server (localhost:3000)               │
│  ├── /index-3d.html         (3D Dashboard)     │
│  ├── /app-3d.js             (3D Scene Logic)   │
│  └── /legacy                (2D Legacy)        │
│                                                  │
│              ↕ HTTP API Calls                   │
│                                                  │
│  Backend API (localhost:3001)                   │
│  ├── /api/services          (Service List)     │
│  ├── /api/metrics           (Real Metrics)     │
│  ├── /api/incidents         (Incident Mgmt)    │
│  ├── /api/logs              (System Logs)      │
│  └── /health                (Status Check)     │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## Configuration

### Frontend Configuration (app-3d.js)
```javascript
const API_HOST = window.location.hostname;  // localhost
const API_PORT = 3001;                       // Backend port
const API_BASE = `http://${API_HOST}:${API_PORT}/api`;
```

### Polling Interval
Update in `app-3d.js` line ~87:
```javascript
setInterval(async () => {
    // Update metrics every 3000ms (3 seconds)
}, 3000);
```

### Metrics Cache
Stores live data in memory:
- `metricsCache`: Service metrics
- `servicesCache`: Service information
- `incidentsCache`: Active incidents

---

## Browser Console

When you open the dashboard, check the console for:

```
✓ Backend is healthy
✓ Live data fetched successfully
✓ NeuroOps 3D Dashboard initialized with live data
```

Or if backend is unavailable:
```
⚠ Backend unreachable on port 3001
⚠ Could not fetch live data, using defaults
🚀 NeuroOps 3D Dashboard initialized with mock data
```

---

## Common Tasks

### Create an Incident
1. Click **⚠️ Trigger Incident** button
2. Random incident is created
3. Service flashes red (1 second)
4. Backend records incident
5. Check metrics update in real-time

### View Service Details
1. Hover over any 3D node → See tooltip
2. Click node → Select service
3. View info panel (bottom-left):
   - Service name & status
   - Live latency, RPS, error rate
   - Dependencies list

### Monitor Live Updates
1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Filter by `/api/metrics`
4. Watch requests every 3 seconds
5. Observe response data updates

---

## Troubleshooting

### "Backend unreachable" warning
```
Solution: Make sure mock-backend.js is running on port 3001
Command: node mock-backend.js
```

### Dashboard not loading
```
Solution: Check frontend server is running on port 3000
Command: node frontend-server.js
Check: http://localhost:3000 in browser
```

### Metrics not updating
```
Solution: Check API responses in browser console
Method: Right-click → Inspect → Console tab
Look for fetch errors or network failures
```

### Port already in use
```bash
# If port 3000 is taken:
# Edit frontend-server.js line ~27
const PORT = 3000;  # Change to 3002 or other

# If port 3001 is taken:
# Edit mock-backend.js line ~330  
const PORT = 3001;  # Change to 3002 or other

# Also update API_PORT in app-3d.js if you change backend port
```

---

## Environment Variables

Create `.env` file in root directory:

```env
# Frontend
FRONTEND_HOST=localhost
FRONTEND_PORT=3000

# Backend (Mock)
BACKEND_HOST=localhost
BACKEND_PORT=3001

# Polling interval (milliseconds)
POLL_INTERVAL=3000
```

Then use in code:
```javascript
const API_PORT = process.env.BACKEND_PORT || 3001;
```

---

## Performance Tips

1. **Reduce Polling**: Increase interval for less network traffic
2. **Optimize 3D**: Reduce particle count for smoother animation
3. **Cache Data**: Backend caches metrics in memory
4. **Compress**: Enable gzip in frontend-server.js

---

## Next Steps

### Going Production
1. Replace mock-backend with real backend server
2. Connect to actual databases (PostgreSQL, Redis)
3. Deploy with Docker: `npm run dev`
4. Set up monitoring with Prometheus/Grafana

### Enhance Dashboard
1. Add more 3D effects and animations
2. Integrate with real incident detection
3. Add AI-powered root cause analysis
4. Create playbook automation UI

---

## Documentation Links

- 📖 [3D Dashboard Guide](./frontend/3D_DASHBOARD_GUIDE.md)
- 🚀 [Quick Start](./3D_QUICKSTART.md)
- 📋 [Architecture](./ARCHITECTURE.md)

---

**Version**: 1.0 (Live Connected)  
**Status**: ✅ Running  
**Tech Stack**: Node.js, Three.js, Express, WebGL
