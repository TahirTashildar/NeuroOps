export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const logs = [
        { timestamp: new Date().toISOString(), level: 'INFO', source: 'auth-service', message: 'User authenticated successfully' },
        { timestamp: new Date().toISOString(), level: 'INFO', source: 'products-service', message: 'Product catalog loaded' },
        { timestamp: new Date().toISOString(), level: 'WARN', source: 'payment-service', message: 'High latency detected' },
    ];

    res.status(200).json({ logs });
}
