import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { queryMany, queryOne, query } from '../../config/database';
import { getMockPlaybooks, logMockDataUsage } from '../../services/mock-data';
import pino from 'pino';

const router = Router();
const logger = pino();

// GET /api/playbooks - List playbooks
router.get('/', async (_req: Request, res: Response) => {
  try {
    const playbooks = await queryMany('SELECT * FROM playbooks ORDER BY created_at DESC');
    return res.json({ playbooks });
  } catch (error) {
    logger.warn('Database query failed, using mock data:', error instanceof Error ? error.message : 'Unknown error');
    logMockDataUsage();
    
    // Fallback to mock data
    const mockPlaybooks = getMockPlaybooks();
    return res.json({ playbooks: mockPlaybooks, source: 'mock' });
  }
});

// GET /api/playbooks/:id - Get playbook details
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const playbook = await queryOne('SELECT * FROM playbooks WHERE id = $1', [req.params.id]);
    if (!playbook) {
      return res.status(404).json({ error: 'Playbook not found' });
    }
    return res.json(playbook);
  } catch (error) {
    logger.warn('Database query failed, using mock data:', error instanceof Error ? error.message : 'Unknown error');
    logMockDataUsage();
    
    // Fallback to mock data
    const mockPlaybooks = getMockPlaybooks();
    const playbook = mockPlaybooks.find(p => p.id === req.params.id);
    if (!playbook) {
      return res.status(404).json({ error: 'Playbook not found' });
    }
    return res.json({ ...playbook, source: 'mock' });
  }
});

// POST /api/playbooks - Create playbook
router.post('/', async (req: Request, res: Response) => {
  try {
    const { incident_id, root_cause, blast_radius, remediation_steps, prevention_measures, confidence } = req.body;
    
    const id = uuidv4();
    const now = new Date();

    await query(
      `INSERT INTO playbooks (id, incident_id, root_cause, blast_radius, remediation_steps, prevention_measures, confidence, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [id, incident_id, root_cause, JSON.stringify(blast_radius), JSON.stringify(remediation_steps), JSON.stringify(prevention_measures), confidence, now]
    );

    const playbook = await queryOne('SELECT * FROM playbooks WHERE id = $1', [id]);
    res.status(201).json(playbook);
  } catch (error) {
    logger.warn('Database write failed, returning mock response:', error instanceof Error ? error.message : 'Unknown error');
    logMockDataUsage();
    
    // Fallback: return the playbook that would have been created
    const id = uuidv4();
    const now = new Date();
    const playbook = {
      id,
      incident_id: req.body.incident_id,
      root_cause: req.body.root_cause,
      blast_radius: req.body.blast_radius || {},
      remediation_steps: req.body.remediation_steps || [],
      prevention_measures: req.body.prevention_measures || [],
      confidence: req.body.confidence || 0.8,
      created_at: now,
      source: 'mock',
    };
    res.status(201).json(playbook);
  }
});

export default router;
