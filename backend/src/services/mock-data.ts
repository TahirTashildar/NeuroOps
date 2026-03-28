/**
 * Mock data service for graceful degradation when database is unavailable
 * Returns realistic demo data for the observability dashboard
 */

import pino from 'pino';

const logger = pino();

export interface Metric {
  service_id: string;
  latency: number;
  rps: number;
  error_rate: number;
  recorded_at: Date;
}

export interface Service {
  id: string;
  name: string;
  icon: string;
  port: number;
  status: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: string;
  target_service: string;
  cascading_services: string[];
  status: string;
  created_at: Date;
}

export interface LogEntry {
  id: string;
  service: string;
  level: string;
  message: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

const MOCK_SERVICES: Service[] = [
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

export function getMockServices(): Service[] {
  logger.info('Returning mock services data');
  return MOCK_SERVICES;
}

export function getMockMetrics(service_id?: string): Metric[] {
  logger.info(`Returning mock metrics${service_id ? ` for service ${service_id}` : ''}`);
  
  const metrics: Metric[] = [];
  const now = new Date();
  
  const services = service_id ? MOCK_SERVICES.filter(s => s.id === service_id) : MOCK_SERVICES;
  
  services.forEach(service => {
    // Generate 10 data points for the last 30 minutes
    for (let i = 10; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 3 * 60 * 1000);
      
      // Generate realistic metrics with some variance
      const baseLatency = Math.random() * 50 + 20;
      const baseRps = Math.random() * 800 + 200;
      const baseErrorRate = Math.random() * 0.5;
      
      metrics.push({
        service_id: service.id,
        latency: Math.round(baseLatency + Math.random() * 20),
        rps: Math.round(baseRps + Math.random() * 100),
        error_rate: Math.min(baseErrorRate + Math.random() * 0.3, 1),
        recorded_at: timestamp,
      });
    }
  });
  
  return metrics;
}

export function getMockIncidents(): Incident[] {
  logger.info('Returning mock incidents data');
  
  return [
    {
      id: '1',
      title: 'Payment Gateway Latency Spike',
      description: 'Payment service experiencing elevated latency',
      severity: 'medium',
      target_service: 'payment',
      cascading_services: ['orders', 'gateway'],
      status: 'investigating',
      created_at: new Date(Date.now() - 15 * 60 * 1000),
    },
    {
      id: '2',
      title: 'Database Connection Pool Saturation',
      description: 'PostgreSQL connection pool reaching limits',
      severity: 'high',
      target_service: 'postgres',
      cascading_services: ['products', 'orders', 'inventory'],
      status: 'investigating',
      created_at: new Date(Date.now() - 45 * 60 * 1000),
    },
    {
      id: '3',
      title: 'Redis Memory Usage Critical',
      description: 'Redis cache memory usage above 85%',
      severity: 'high',
      target_service: 'redis',
      cascading_services: ['inventory', 'auth'],
      status: 'investigating',
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
  ];
}

export function getMockDependencies(service_id: string): { id: string; target: string }[] {
  logger.info(`Returning mock dependencies for service ${service_id}`);
  
  const dependencies: { [key: string]: string[] } = {
    gateway: ['auth', 'products', 'orders'],
    orders: ['payment', 'inventory', 'postgres'],
    products: ['postgres'],
    payment: [],
    auth: [],
    inventory: ['redis', 'postgres'],
    notification: ['rabbitmq'],
    postgres: [],
    redis: [],
    rabbitmq: [],
  };
  
  return (dependencies[service_id] || []).map(target => ({
    id: `${service_id}->${target}`,
    target,
  }));
}

export function getMockLogs(service?: string, level?: string): LogEntry[] {
  logger.info(`Returning mock logs${service ? ` for service ${service}` : ''}${level ? ` with level ${level}` : ''}`);
  
  const logMessages = [
    'Request processed successfully',
    'Database query executed',
    'Cache hit for key',
    'Authentication successful',
    'Connection established',
    'Timeout warning',
    'Retry attempt 1',
    'Service health check passed',
    'Dependency resolved',
  ];
  
  const services = ['gateway', 'auth', 'products', 'orders', 'payment', 'inventory'];
  const levels = ['info', 'info', 'info', 'info', 'warn', 'error'];
  
  const logs: LogEntry[] = [];
  const now = new Date();
  
  for (let i = 0; i < 50; i++) {
    const randomService = service || services[Math.floor(Math.random() * services.length)];
    const randomLevel = level || levels[Math.floor(Math.random() * levels.length)];
    const randomMessage = logMessages[Math.floor(Math.random() * logMessages.length)];
    const timestamp = new Date(now.getTime() - Math.random() * 60 * 60 * 1000);
    
    logs.push({
      id: `log-${i}`,
      service: randomService,
      level: randomLevel,
      message: randomMessage,
      timestamp,
    });
  }
  
  return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export function getMockPlaybooks(): any[] {
  logger.info('Returning mock playbooks data');
  
  return [
    {
      id: '1',
      incident_id: '1',
      root_cause: 'Memory leak in payment service causing OOM kills',
      blast_radius: { affected_services: 4, impacted_users: 15000 },
      remediation_steps: [
        'Scale payment pods horizontally',
        'Enable memory limits and auto-restart',
        'Deploy fix for memory leak',
      ],
      prevention_measures: [
        'Add heap profiling to CI/CD',
        'Set up memory alerts at 75%',
        'Monthly memory audit',
      ],
      confidence: 0.95,
      created_at: new Date(Date.now() - 1 * 60 * 60 * 1000),
    },
    {
      id: '2',
      incident_id: '2',
      root_cause: 'Unoptimized SQL query causing table scans',
      blast_radius: { affected_services: 3, impacted_users: 8000 },
      remediation_steps: [
        'Add index on user_id column',
        'Optimize query with EXPLAIN ANALYZE',
        'Update query planner statistics',
      ],
      prevention_measures: [
        'Query performance monitoring',
        'Slow query logging',
        'Code review checklist for SQL',
      ],
      confidence: 0.92,
      created_at: new Date(Date.now() - 4 * 60 * 60 * 1000),
    },
  ];
}

export function logMockDataUsage(): void {
  logger.warn('⚠️  Using mock data - database connection unavailable');
  logger.warn('To use real data, ensure PostgreSQL and Redis are properly configured');
}
