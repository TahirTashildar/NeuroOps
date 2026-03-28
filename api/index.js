const http = require('http');
const url = require('url');

// In-memory storage (simulating database)
let incidents = [];
let services = [
    { id: 'gateway', name: 'API Gateway', icon: '⬡', port: 3000, status: 'healthy' },
    { id: 'auth', name: 'Auth Service', icon: '🔐', port: 3001, status: 'healthy' },
    { id: 'products', name: 'Product Catalog', icon: '📦', port: 3002, status: 'healthy' },
    { id: 'orders', name: 'Order Manager', icon: '🧾', port: 3003, status: 'healthy' },
    { id: 'payment', name: 'Payment Engine', icon: '💳', port: 3004, status: 'healthy' },
    { id: 'inventory', name: 'Inventory Sync', icon: '🗄', port: 3005, status: 'healthy' },
    { id: 'notification', name: 'Notifications', icon: '🔔', port: 3006, status: 'healthy' },
    { id: 'postgres', name: 'PostgreSQL', icon: '🐘', port: 5432, status: 'healthy' },
    { id: 'redis', name: 'Redis Cache', icon: '⚡', port: 6379, status: 'healthy' },
    { id: 'rabbitmq', name: 'RabbitMQ', icon: '🐇', port: 5672, status: 'healthy' },
];

let logs = [];
let playbooks = [];

const INCIDENTS_DATA = [
    { id: 'payment_crash', label: '💳 Payment Crash', target: 'payment', sev: 'critical', cascades: ['orders', 'gateway'] },
    { id: 'checkout_timeout', label: '🛒 Checkout Timeout', target: 'orders', sev: 'high', cascades: ['payment', 'inventory'] },
    { id: 'db_slowdown', label: '🐘 DB Saturation', target: 'postgres', sev: 'high', cascades: ['products', 'orders'] },
];

// CORS headers
function setCorsHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');
}

// Generate random metrics
function generateMetrics() {
    return services.map(service => ({
        service_id: service.id,
        latency: Math.round(Math.random() * 200 + 10),
        rps: Math.round(Math.random() * 3000 + 100),
        error_rate: Math.max(0, Math.round((Math.random() * 5 - Math.random()) * 100)) / 100,
        timestamp: new Date().toISOString()
    }));
}

// API Handlers
const handlers = {
    '/api/services': (req, res) => {
        setCorsHeaders(res);
        res.writeHead(200);
        res.end(JSON.stringify(services));
    },

    '/api/metrics': (req, res) => {
        setCorsHeaders(res);
        res.writeHead(200);
        res.end(JSON.stringify({ metrics: generateMetrics() }));
    },

    '/api/incidents': (req, res) => {
        setCorsHeaders(res);
        if (req.method === 'GET') {
            res.writeHead(200);
            res.end(JSON.stringify({ incidents: incidents }));
        } else if (req.method === 'POST') {
            let data = '';
            req.on('data', chunk => data += chunk);
            req.on('end', () => {
                try {
                    const incident = JSON.parse(data);
                    incident.id = `INC-${Date.now()}`;
                    incident.created_at = new Date().toISOString();
                    incident.status = 'active';
                    incident.phase = 'detection';
                    incidents.push(incident);
                    res.writeHead(201);
                    res.end(JSON.stringify(incident));
                } catch (e) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ error: 'Invalid JSON' }));
                }
            });
        } else {
            res.writeHead(405);
            res.end(JSON.stringify({ error: 'Method not allowed' }));
        }
    },

    '/api/logs': (req, res) => {
        setCorsHeaders(res);
        res.writeHead(200);
        res.end(JSON.stringify({ logs: logs }));
    },

    '/api/playbooks': (req, res) => {
        setCorsHeaders(res);
        res.writeHead(200);
        res.end(JSON.stringify({ playbooks: playbooks }));
    },

    '/health': (req, res) => {
        setCorsHeaders(res);
        res.writeHead(200);
        res.end(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }));
    }
};

// Main handler
function requestHandler(req, res) {
    const pathname = url.parse(req.url).pathname;
    
    // Handle OPTIONS requests
    if (req.method === 'OPTIONS') {
        setCorsHeaders(res);
        res.writeHead(200);
        res.end();
        return;
    }

    // Route requests
    if (handlers[pathname]) {
        handlers[pathname](req, res);
    } else {
        setCorsHeaders(res);
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Not found' }));
    }
}

module.exports = requestHandler;
