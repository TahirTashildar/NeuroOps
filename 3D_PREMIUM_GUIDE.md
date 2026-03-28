# NeuroOps 3D Premium — Spline.Design Inspired Dashboard

## 🎨 Overview

The premium 3D dashboard features a modern, professional UI/UX inspired by **Spline.design** with:

- **3D Glassmorphism UI** with premium blur effects
- **Real-time 3D Graphs** for metrics visualization
- **Bloom Post-Processing** for enhanced visuals
- **Large, Bold Typography** (Poppins for headings, Inter for body)
- **Smooth Animations** with eased camera transitions
- **Enhanced Lighting** with multiple colored point lights
- **Interactive 3D Service Topology** with dependency visualization

## 📊 Features

### Real-Time 3D Graphs
- **Latency Chart** (ms) — Visual 3D bar chart
- **RPS Chart** — Throughput visualization in 3D space
- **Error Rate Graph** — 3D line graph showing error trends

### Premium UI Elements
- Floating glass panels with backdrop blur
- Large header statistics (28px fonts)
- Smooth transitions and animations
- Glassmorphic borders and backgrounds
- Enhanced tooltip system

### Advanced Interactions
- **Keyboard Shortcuts:**
  - `R` - Reset view to default camera position
  - `D` - Toggle dependency visualization
  - `P` - Toggle particle effects (1000 premium particles)
  - `A` - Toggle auto-rotation
  - `C` - Cycle through 4 camera angles
  - `I` - Trigger incident simulation

- **Mouse Interactions:**
  - Drag to rotate the scene
  - Scroll to zoom
  - Right-click to pan
  - Click to select service nodes

### Spline.Design Aesthetic
✦ Smooth, rounded geometry with icosahedrons
✦ Premium color palette with emissive materials
✦ Glassmorphism with backdrop filters
✦ Soft shadows and enhanced depth
✦ Smooth easing curves for all animations
✦ Consistent spacing and typography

## 🚀 Color Palette

- **Background:** Deep blue gradient (#050a1f → #0a1540)
- **Surface:** Glass (#0a0f2e with 0.8 opacity)
- **Primary Blue:** #64b5f6
- **Primary Green:** #81c784
- **Primary Purple:** #b39ddb
- **Accent Cyan:** #00d4ff
- **Error Red:** #ff4757
- **Success Green:** #2ed573
- **Warning Yellow:** #ffa502

## 📐 Typography

- **Headings:** Poppins 600-900 weight (bold & modern)
- **Body:** Inter 300-700 weight (clean & readable)
- **Sizes:**
  - Header logo: 32px (Poppins 900)
  - Stats values: 28px (Poppins 800)
  - Panel titles: 18px (Poppins 800)
  - Item values: 18px (bold)
  - Labels: 12px (uppercase)
  - Tooltips: 13-16px

## 🎬 Animation Details

### Camera Animations
- Smooth easing (cubic ease-out)
- 1.2 second transitions to selected nodes
- 1.0 second transitions between camera views
- Lerp-based positioning for smooth motion

### Node Animations
- Gentle orbit wobble (0.4 scale at 0.4 second cycle)
- Rotation on X and Y axes (0.003, 0.005 per frame)
- Dynamic glow pulsing based on metrics
- Scale transitions on hover/select

### Effects
- Bloom post-processing (UnrealBloomPass)
- HDR tone mapping (ACESFilmic)
- Shadow mapping with high resolution
- Fog for depth perception
- Star background with smooth animation

## 🔌 API Integration

### Live Data Fetching
- Polls backend every 3 seconds
- Fetches metrics from `/api/metrics`
- Updates service latency, RPS, and error rates
- Auto-updates 3D graph visualizations

### Health Check
- Pings backend at startup
- Falls back to mock data if unavailable
- Continuous monitoring with retry logic

## 📍 File Structure

```
frontend/public/
├── index-3d-premium.html    ← Premium 3D UI structure
├── app-3d-premium.js         ← Premium 3D scene & graphs
├── index-3d.html             ← Standard 3D version
├── app-3d.js                 ← Standard 3D script
├── index.html                ← Legacy 2D version
└── app.js                    ← Legacy 2D script
```

## 🌐 Access URLs

- **Premium Dashboard:** http://localhost:3000 (default)
- **Standard 3D:** http://localhost:3000/3d
- **Legacy 2D:** http://localhost:3000/legacy
- **Backend API:** http://localhost:3001

## 🛠 Deployment

Run from root directory:

```bash
# Start both frontend and backend
npm start

# Or manually:
node frontend-server.js    # Frontend on 3000
node mock-backend.js       # Backend on 3001
```

## 🎯 Future Enhancements

- [ ] WebGL 2 features for advanced rendering
- [ ] VR/XR support for immersive analytics
- [ ] Advanced incident timeline scrubbing
- [ ] Real-time causal analysis visualization
- [ ] Custom theme editor
- [ ] Service dependency auto-layout
- [ ] Real-time alert animations

## 📝 Notes

- Bloom intensity tuned to 1.5 for premium visual effect
- 4096x4096 shadow maps for sharp details
- Multiple colored lights for natural ambiance
- Glassmorphism achieved with `backdrop-filter: blur(20px)`
- 1000 particles for premium smoke/dust effect
- All animations use hardware-accelerated GPU rendering

---

**Created:** March 28, 2026  
**Version:** 4.0 Premium  
**Framework:** Three.js r128  
**UI Inspired By:** Spline.Design
