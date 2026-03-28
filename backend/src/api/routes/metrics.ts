import { Router, Request, Response } from 'express';
import { queryMany } from '../../config/database';
import { getMockMetrics, logMockDataUsage } from '../../services/mock-data';
import pino from 'pino';

const router = Router();
const logger = pino();

// GET /api/metrics - Get aggregated metrics
router.get('/', async (req: Request, res: Response) => {
  try {
    const { service_id } = req.query;
    
    let sql = 'SELECT * FROM metrics WHERE 1=1';
    const params: any[] = [];

    if (service_id) {
      sql += ' AND service_id = $' + (params.length + 1);
      params.push(service_id);
    }

    sql += ' ORDER BY recorded_at DESC LIMIT 100';
    const metrics = await queryMany(sql, params);
    res.json({ metrics });
  } catch (error) {
    logger.warn('Database query failed, using mock data:', error instanceof Error ? error.message : 'Unknown error');
    logMockDataUsage();
    
    // Fallback to mock data
    const mockMetrics = getMockMetrics(typeof (req.query.service_id) === 'string' ? req.query.service_id : undefined);
    res.json({ metrics: mockMetrics, source: 'mock' });
  }
});

// POST /api/metrics - Record metrics
router.post('/', async (_req: Request, res: Response) => {
  try {
    const now = new Date();

    // This will be batched by the backend from Prometheus
    res.json({ success: true, recorded_at: now });
  } catch (error) {
    logger.warn('Failed to record metrics:', error instanceof Error ? error.message : 'Unknown error');
    // Still return success for POST to metrics endpoint
    res.json({ success: true, recorded_at: new Date(), source: 'mock' });
  }
});

// GET /api/metrics/timeseries - Get time-series data
router.get('/timeseries/:service_id', async (req: Request, res: Response) => {
  try {
    const { period = '1h' } = req.query;
    
    const data = await queryMany(
      `SELECT recorded_at, latency, rps, error_rate 
       FROM metrics 
       WHERE service_id = $1 AND recorded_at > NOW() - INTERVAL $2
       ORDER BY recorded_at ASC`,
      [req.params.service_id, period]
    );

    res.json({ data });
  } catch (error) {
    logger.warn('Database query failed, using mock data:', error instanceof Error ? error.message : 'Unknown error');
    logMockDataUsage();
    
    // Fallback to mock data
    const mockMetrics = getMockMetrics(req.params.service_id);
    res.json({ data: mockMetrics, source: 'mock' });
  }
});

export default router;
