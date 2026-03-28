const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the frontend/public directory
app.use(express.static(path.join(__dirname, 'frontend', 'public')));

// Serve the premium 3D dashboard as default
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'public', 'index-3d-premium.html'));
});

// Serve the standard 3D dashboard on demand
app.get('/3d', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'public', 'index-3d.html'));
});

// Serve the legacy 2D dashboard on demand
app.get('/legacy', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'public', 'index.html'));
});

// Serve the premium 3D dashboard for all other routes (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'public', 'index-3d-premium.html'));
});

const PORT = 3000;
app.listen(PORT, 'localhost', () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║    ✨ NeuroOps 3D Premium Dashboard Server v4.0 ✨      ║
║              Running on http://localhost:3000              ║
╚════════════════════════════════════════════════════════════╝

🌐 Application is ready!
📊 Backend API: http://localhost:3001
🎯 Premium 3D Dashboard: http://localhost:3000 (Default)
📊 Standard 3D Dashboard: http://localhost:3000/3d
📊 Legacy 2D Dashboard: http://localhost:3000/legacy

✨ Premium Features:
   • Spline.design-inspired UI/UX with glassmorphism
   • Real-time 3D graphs for metrics visualization
   • Bloom post-processing effects
   • Large, bold typography (Poppins + Inter)
   • Smooth camera animations & multiple views
   • Enhanced lighting and dynamic node animations
   • Interactive service topology with dependencies
   • Live metrics polling every 3 seconds

🎨 Keyboard Shortcuts:
   R - Reset View        D - Toggle Dependencies
   P - Particle Effects  A - Auto-Rotate
   C - Cycle Cameras     I - Trigger Incident

To stop the server, press Ctrl+C
    `);
});

process.on('SIGINT', () => {
    console.log('\n✓ Frontend server stopped');
    process.exit(0);
});