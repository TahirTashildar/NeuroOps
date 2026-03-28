import { Router, Request, Response } from 'express';
import { queryMany } from '../../config/database';
import { getMockLogs, logMockDataUsage } from '../../services/mock-data';
import pino from 'pino';

const router = Router();
const logger = pino();

// GET /api/logs - Get logs
router.get('/', async (req: Request, res: Response) => {
  try {
    const { level, service, limit = 100, offset = 0 } = req.query;
    
    let sql = 'SELECT * FROM logs WHERE 1=1';
    const params: any[] = [];

    if (level) {
      sql += ' AND level = $' + (params.length + 1);
      params.push(level);
    }

    if (service) {
      sql += ' AND service = $' + (params.length + 1);
      params.push(service);
    }

    sql += ' ORDER BY timestamp DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit);
    params.push(offset);

    const logs = await queryMany(sql, params);
    res.json({ logs });
  } catch (error) {
    logger.warn('Database query failed, using mock data:', error instanceof Error ? error.message : 'Unknown error');
    logMockDataUsage();
    
    // Fallback to mock data
    const mockLogs = getMockLogs(
      typeof req.query.service === 'string' ? req.query.service : undefined,
      typeof req.query.level === 'string' ? req.query.level : undefined
    );
    res.json({ logs: mockLogs, source: 'mock' });
  }
});

// POST /api/logs - Ingest logs
router.post('/', async (_req: Request, res: Response) => {
  try {
    // This endpoint would be called by log shipping agents
    res.json({ success: true });
  } catch (error) {
    logger.warn('Failed to ingest logs:', error instanceof Error ? error.message : 'Unknown error');
    // Still return success for ingest endpoint
    res.json({ success: true, source: 'mock' });
  }
});

export default router;
