export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const playbooks = [
        {
            id: 'pb-001',
            incident_id: 'INC-001',
            title: 'Payment Service Recovery',
            status: 'resolved',
            steps: ['Identify root cause', 'Scale replicas', 'Monitor recovery'],
            created_at: new Date().toISOString(),
        },
    ];

    res.status(200).json({ playbooks });
}
