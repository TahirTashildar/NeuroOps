export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Generate random metrics for each service
    const services = ['gateway', 'auth', 'products', 'orders', 'payment', 'inventory', 'notification', 'postgres', 'redis', 'rabbitmq'];
    
    const metrics = services.map(service => ({
        service_id: service,
        latency: Math.round(Math.random() * 200 + 10),
        rps: Math.round(Math.random() * 3000 + 100),
        error_rate: Math.max(0, Math.random() * 5) * 100,
        timestamp: new Date().toISOString(),
    }));

    res.status(200).json({ metrics });
}
