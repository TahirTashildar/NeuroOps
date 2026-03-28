import express, { Express, Request, Response, NextFunction } from 'express';
// Prometheus metrics
import client from 'prom-client';
// OpenTelemetry tracing
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import cors from 'cors';
import pino from 'pino';
import config from './config';
import { getConnection, closePool } from './config/database';
import { getRedis, closeRedis } from './config/redis';

// Routes
import incidentRoutes from './api/routes/incidents';
import metricsRoutes from './api/routes/metrics';
import servicesRoutes from './api/routes/services';
import playbooksRoutes from './api/routes/playbooks';
import logsRoutes from './api/routes/logs';

// Workers
import { startIncidentDetector } from './workers/incident-detector';
import { startCausalAnalyzer } from './workers/causal-analyzer';


// --- OpenTelemetry Tracing Init ---
// Only enable Jaeger if endpoint is explicitly configured
if (process.env.JAEGER_ENDPOINT) {
  try {
    const sdk = new NodeSDK({
      traceExporter: new JaegerExporter({
        endpoint: process.env.JAEGER_ENDPOINT,
      }),
      instrumentations: [getNodeAutoInstrumentations()],
    });
    sdk.start();
    console.log('✓ Jaeger tracing initialized');
  } catch (error) {
    console.warn('⚠ Jaeger tracing initialization failed, continuing without tracing');
  }
} else {
  console.log('ℹ Jaeger tracing disabled (JAEGER_ENDPOINT not set)');
}

// --- Prometheus Metrics Init ---
client.collectDefaultMetrics();

const logger = pino({ level: config.logging.level });

export function createApp(): Express {
  const app = express();

  // Security Middleware
  app.use(helmet());
  
  // Logging Middleware
  app.use(pinoHttp({ logger }));

  // CORS
  app.use(cors({ origin: '*', credentials: true }));

  // Body Parser
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  });
  app.use('/api/', limiter);

  // Health Check
  app.get('/health', async (_req: Request, res: Response) => {
    try {
      const timestamp = new Date().toISOString();
      const response: any = {
        status: 'healthy',
        timestamp,
        version: '2.5.0',
        services: {
          database: false,
          redis: false,
        },
      };

      // Check database
      try {
        const db = getConnection();
        await Promise.race([
          db.query('SELECT NOW()'),
          new Promise((_, reject) => setTimeout(() => reject(new Error('DB timeout')), 3000)),
        ]);
        response.services.database = true;
      } catch (error) {
        logger.warn('Database health check failed');
      }

      // Check Redis
      try {
        const redis = getRedis();
        await Promise.race([
          redis.ping(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Redis timeout')), 3000)),
        ]);
        response.services.redis = true;
      } catch (error) {
        logger.warn('Redis health check failed');
      }

      res.json(response);
    } catch (error) {
      res.status(503).json({
        status: 'limited',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // API Routes
  app.use('/api/incidents', incidentRoutes);
  app.use('/api/metrics', metricsRoutes);
  app.use('/api/services', servicesRoutes);
  app.use('/api/playbooks', playbooksRoutes);
  app.use('/api/logs', logsRoutes);

  // Prometheus metrics endpoint
  app.get('/metrics', async (_req: Request, res: Response) => {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  });

  // 404 Handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not Found' });
  });

  // Error Handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    logger.error(err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: config.env === 'development' ? err.message : undefined,
    });
  });

  return app;
}

export async function startServer(): Promise<void> {
  try {
    const app = createApp();

    // Initialize database connection (optional - continue if fails)
    try {
      const db = getConnection();
      await db.query('SELECT NOW()');
      logger.info('✓ Database connected');
    } catch (dbError) {
      logger.warn('⚠ Database connection failed, running in memory-only mode');
      logger.warn(dbError instanceof Error ? dbError.message : 'Unknown database error');
    }

    // Initialize Redis connection (optional - continue if fails)
    try {
      const redis = getRedis();
      await redis.ping();
      logger.info('✓ Redis connected');
    } catch (redisError) {
      logger.warn('⚠ Redis connection failed, continuing without caching');
      logger.warn(redisError instanceof Error ? redisError.message : 'Unknown redis error');
    }

    // Start background workers (optional - continue if fails)
    try {
      startIncidentDetector();
      startCausalAnalyzer();
      logger.info('✓ Background workers started');
    } catch (workerError) {
      logger.warn('⚠ Failed to start background workers');
      logger.warn(workerError instanceof Error ? workerError.message : 'Unknown worker error');
    }

    // Start server
    app.listen(config.port, config.apiHost, () => {
      logger.info(`✓ NeuroOps API server running on http://${config.apiHost}:${config.port}`);
      logger.info(`✓ Environment: ${config.env}`);
      logger.info('✓ Server ready to accept requests');
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, shutting down gracefully...');
      await closePool();
      await closeRedis();
      process.exit(0);
    });
  } catch (error) {
    logger.error(error, 'Failed to start server');
    process.exit(1);
  }
}
