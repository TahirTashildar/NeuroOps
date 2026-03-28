const incidents = [];

export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'GET') {
        res.status(200).json({ incidents });
    } else if (req.method === 'POST') {
        const incident = {
            ...req.body,
            id: `INC-${Date.now()}`,
            created_at: new Date().toISOString(),
            status: 'active',
        };
        incidents.push(incident);
        res.status(201).json(incident);
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
