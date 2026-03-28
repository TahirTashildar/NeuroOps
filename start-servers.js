#!/usr/bin/env node

/**
 * NeuroOps 3D Dashboard - Unified Server Launcher
 * Starts both backend (mock) and frontend servers with live reload capability
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const rootDir = __dirname;
const backendPort = 3001;
const frontendPort = 3000;

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

function log(label, message, color = colors.reset) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${colors.bright}${color}[${timestamp}] ${label}${colors.reset} ${message}`);
}

function startBackend() {
  log('[BACKEND]', 'Starting Mock Backend API...', colors.blue);
  
  const backend = spawn('node', ['mock-backend.js'], {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true,
  });

  backend.on('error', (err) => {
    log('[BACKEND]', `Error: ${err.message}`, colors.red);
  });

  backend.on('exit', (code) => {
    log('[BACKEND]', `Exited with code ${code}`, colors.yellow);
  });

  return backend;
}

function startFrontend() {
  log('[FRONTEND]', 'Starting Frontend Server...', colors.cyan);
  
  const frontend = spawn('node', ['frontend-server.js'], {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true,
  });

  frontend.on('error', (err) => {
    log('[FRONTEND]', `Error: ${err.message}`, colors.red);
  });

  frontend.on('exit', (code) => {
    log('[FRONTEND]', `Exited with code ${code}`, colors.yellow);
  });

  return frontend;
}

function displayBanner() {
  console.log(`
${colors.bright}${colors.cyan}
╔════════════════════════════════════════════════════════════╗
║       ✨ NeuroOps 3D Dashboard - Live Server ✨           ║
║                                                            ║
║  🚀 Starting unified frontend and backend servers...     ║
╚════════════════════════════════════════════════════════════╝
${colors.reset}
  `);
}

function displayReadyMessage() {
  setTimeout(() => {
    console.log(`
${colors.bright}${colors.green}
╔════════════════════════════════════════════════════════════╗
║            ✓ NeuroOps Stack Ready to Use!                ║
╚════════════════════════════════════════════════════════════╝
${colors.reset}

${colors.bright}📊 Dashboard:${colors.reset}
   🌐 Open: http://localhost:${frontendPort}
   📐 3D Scene: Fully interactive with real-time data

${colors.bright}🔌 Backend API:${colors.reset}
   📡 Mock API: http://localhost:${backendPort}
   🔗 Endpoints available

${colors.bright}🎨 Features:${colors.reset}
   ✓ Real-time service topology
   ✓ Interactive 3D visualization
   ✓ Live incident simulation
   ✓ Modern neon color palette
   ✓ Advanced interactions (drag, rotate, zoom)

${colors.bright}📚 Links:${colors.reset}
   📖 Documentation: ./frontend/3D_DASHBOARD_GUIDE.md
   🚀 Quick Start: ./3D_QUICKSTART.md

${colors.bright}⌨️  Navigation:${colors.reset}
   🖱️  Drag to rotate  |  Scroll to zoom  |  Click to select
   🔄 Click controls for advanced options

${colors.bright}🛑 To stop servers:${colors.reset}
   Press ${colors.bright}Ctrl+C${colors.reset}

    `);
  }, 2000);
}

async function main() {
  displayBanner();

  // Start both servers
  const backend = startBackend();
  const frontend = startFrontend();

  // Display ready message after a delay
  displayReadyMessage();

  // Handle graceful shutdown
  const shutdown = async () => {
    log('[SYSTEM]', 'Shutting down servers...', colors.yellow);
    
    backend.kill('SIGTERM');
    frontend.kill('SIGTERM');

    setTimeout(() => {
      if (!backend.killed) backend.kill('SIGKILL');
      if (!frontend.killed) frontend.kill('SIGKILL');
      log('[SYSTEM]', 'Servers stopped', colors.green);
      process.exit(0);
    }, 3000);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  log('[ERROR]', err.message, colors.red);
  process.exit(1);
});
