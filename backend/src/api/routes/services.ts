import { Router, Request, Response } from 'express';
import { queryMany, queryOne } from '../../config/database';
import { getMockServices, getMockMetrics, getMockDependencies, logMockDataUsage } from '../../services/mock-data';
import pino from 'pino';

const router = Router();
const logger = pino();

// GET /api/services - List all services
router.get('/', async (_req: Request, res: Response) => {
  try {
    const services = await queryMany('SELECT * FROM services ORDER BY name ASC');
    return res.json({ services });
  } catch (error) {
    logger.warn('Database query failed, using mock data:', error instanceof Error ? error.message : 'Unknown error');
    logMockDataUsage();
    
    // Fallback to mock data
    const mockServices = getMockServices();
    return res.json({ services: mockServices, source: 'mock' });
  }
});

// GET /api/services/:id - Get service details
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const service = await queryOne('SELECT * FROM services WHERE id = $1', [req.params.id]);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    return res.json(service);
  } catch (error) {
    logger.warn('Database query failed, using mock data:', error instanceof Error ? error.message : 'Unknown error');
    logMockDataUsage();
    
    // Fallback to mock data
    const mockServices = getMockServices();
    const service = mockServices.find(s => s.id === req.params.id);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    return res.json({ ...service, source: 'mock' });
  }
});

// GET /api/services/:id/dependencies - Get service dependencies
router.get('/:id/dependencies', async (req: Request, res: Response) => {
  try {
    const deps = await queryMany(
      'SELECT * FROM service_dependencies WHERE service_id = $1',
      [req.params.id]
    );
    res.json({ dependencies: deps });
  } catch (error) {
    logger.warn('Database query failed, using mock data:', error instanceof Error ? error.message : 'Unknown error');
    logMockDataUsage();
    
    // Fallback to mock data
    const mockDeps = getMockDependencies(req.params.id);
    res.json({ dependencies: mockDeps, source: 'mock' });
  }
});

// GET /api/services/:id/health - Get service health
router.get('/:id/health', async (req: Request, res: Response) => {
  try {
    const health = await queryOne(
      `SELECT s.*, 
              (SELECT AVG(latency) FROM metrics WHERE service_id = $1 AND recorded_at > NOW() - INTERVAL '5 minutes') as avg_latency,
              (SELECT AVG(error_rate) FROM metrics WHERE service_id = $1 AND recorded_at > NOW() - INTERVAL '5 minutes') as avg_error_rate
       FROM services s WHERE s.id = $1`,
      [req.params.id]
    );
    res.json(health);
  } catch (error) {
    logger.warn('Database query failed, using mock data:', error instanceof Error ? error.message : 'Unknown error');
    logMockDataUsage();
    
    // Fallback to mock data
    const mockServices = getMockServices();
    const mockMetrics = getMockMetrics(req.params.id);
    const service = mockServices.find(s => s.id === req.params.id);
    
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    const avgLatency = mockMetrics.length > 0 
      ? mockMetrics.reduce((sum: number, m: any) => sum + (m.latency || 0), 0) / mockMetrics.length 
      : 0;
    const avgErrorRate = mockMetrics.length > 0 
      ? mockMetrics.reduce((sum: number, m: any) => sum + (m.error_rate || 0), 0) / mockMetrics.length 
      : 0;
    
    return res.json({ 
      ...service, 
      avg_latency: avgLatency, 
      avg_error_rate: avgErrorRate, 
      source: 'mock' 
    });
  }
});

export default router;
