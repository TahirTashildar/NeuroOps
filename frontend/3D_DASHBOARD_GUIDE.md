# NeuroOps 3D Dashboard - Implementation Guide

## Overview
Your NeuroOps website has been completely transformed into a fully interactive 3D dashboard with modern aesthetics, new fonts, dynamic color palette, and rich interactions.

## What's New

### 🎨 Design Updates
- **New Color Palette**: Modern neon with vibrant purples, cyans, and greens on a dark background
  - Primary Blue: `#64b5f6`
  - Purple Accent: `#b39ddb`
  - Green Accent: `#81c784`
  - Dark Background: `#0a0e27`
  
- **Modern Fonts**: 
  - **Inter** - Clean, modern sans-serif for body text
  - **Poppins** - Bold, friendly sans-serif for headings

### 🌐 3D Interactive Scene
- **Full 3D Visualization**: Service topology rendered in 3D space using Three.js
- **Service Nodes**: Each service represented as a glowing 3D sphere with:
  - Color-coded by type
  - Label with icon and name
  - Real-time emissive glow effects
  - Smooth shadows and lighting

### 🖱️ Rich Interactions
1. **Drag/Rotate**: Click and drag to rotate the 3D scene
2. **Zoom**: Scroll to zoom in/out
3. **Pan**: Right-click to pan around
4. **Hover Effects**: 
   - Nodes scale up on hover
   - Tooltips show service metrics (latency, RPS, error rate)
   - Smooth animations on interaction
5. **Click to Select**: 
   - Click any service node to select it
   - View detailed information panel
   - Camera smoothly animates to focus on selected node

### ⚙️ Control Panel
Located in the top-right corner with quick action buttons:

- **🔄 Reset View** - Reset camera to default position
- **🔁 Auto Rotate** - Toggle automatic scene rotation
- **✨ Particles** - Toggle particle effect system
- **⚠️ Trigger Incident** - Simulate an incident on a random service

### 📊 Live Dashboard Stats
Header displays real-time statistics:
- **Services**: Total number of services
- **Health**: System health percentage
- **Latency**: Average latency across all services

## File Structure

```
frontend/public/
├── index-3d.html      # New 3D dashboard (main entry point)
├── app-3d.js          # 3D scene logic and interactions
├── index.html         # Original 2D dashboard (legacy)
└── app.js             # Original JavaScript (legacy)
```

## How to Use

### Running the 3D Dashboard
1. Open your browser to your dashboard URL
2. Navigate to `/index-3d.html` or set it as the default in `frontend-server.js`

### Navigation Controls
- **Mouse Drag**: Rotate the scene
- **Mouse Scroll**: Zoom in/out
- **Right Click + Drag**: Pan
- **Click Node**: Select and view details
- **Click Elsewhere**: Deselect

### Interactive Features
1. **Hover over any service** to see:
   - Service name and icon
   - Current latency
   - Requests per second (RPS)
   - Error rate percentage
   - Port number

2. **Click a service** to:
   - Highlight it with full emissive glow
   - See detailed information panel
   - Auto-focus camera on the node

3. **Use Control Panel** to:
   - Reset view and return to default
   - Enable/disable auto-rotation
   - Toggle particle effects
   - Trigger incidents for testing

## Customization

### Colors
Edit the CSS variables in `index-3d.html`:
```css
:root {
    --acc-blue: #64b5f6;
    --acc-purple: #b39ddb;
    --acc-green: #81c784;
    --bg: #0a0e27;
    /* ...more colors */
}
```

### Service Colors
Each service has a unique color defined in `app-3d.js`:
```javascript
const SERVICES = [
    { id: 'gateway', ..., color: 0x64b5f6 },
    { id: 'auth', ..., color: 0x81c784 },
    // ...
];
```

### 3D Scene Properties
Adjust camera, lighting, and physics in `app-3d.js`:
- **Camera FOV**: Update `new THREE.PerspectiveCamera(75, ...)`
- **Node size**: Change `new THREE.IcosahedronGeometry(1.5, 4)` radius
- **Lighting intensity**: Modify `ambientLight` and `directionalLight` values

## Advanced Features

### Particle System
- 500 particles that bounce around the scene
- Toggle with **✨ Particles** button
- Customizable velocity and behavior

### Incident Simulation
- **⚠️ Trigger Incident** randomly selects and flashes a service red
- Simulates an incident alert
- Can be integrated with real incident data from your API

### Auto-Rotation
- Smooth continuous rotation mode
- Useful for displays/presentations
- Toggle with **🔁 Auto Rotate**

## Integration with Backend

The dashboard is ready to integrate with your NeuroOps backend API:

```javascript
const API_BASE = `http://${API_HOST}:${API_PORT}/api`;
```

To fetch real data instead of mock data:
1. Replace the static `SERVICES` array with API calls
2. Hook into your `/api/services` endpoint
3. Update stats and incident data dynamically

Example:
```javascript
fetch(`${API_BASE}/services`)
    .then(res => res.json())
    .then(data => {
        // Update SERVICES with real data
        // Refresh scene
    });
```

## Performance Optimizations

- **Hardware acceleration**: Uses WebGL with high-performance settings
- **Efficient rendering**: Icosahedron geometry for optimal polygon count
- **Smooth animations**: 60 FPS target with damping controls
- **Responsive**: Automatically adapts to window resize

## Browser Compatibility

Works best in modern browsers with WebGL support:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Troubleshooting

**Scene not loading?**
- Ensure Three.js CDN is accessible
- Check browser console for errors
- Verify WebGL is supported

**Performance issues?**
- Reduce particle count
- Lower renderer resolution
- Use `maxDistance` controls to limit zoom

**Mouse interactions not working?**
- Make sure canvas has focus
- Check for browser zoom level
- Verify OrbitControls.js is loaded

## Future Enhancements

- Connect to real API data
- Add more incident types and effects
- Implement service dependency highlighting
- Add performance graphs overlay
- Real-time metric animations
- Service health color coding
- Export/report generation

---

**Version**: 1.0  
**Created**: 2026-03-28  
**Technology**: Three.js, WebGL, HTML5
