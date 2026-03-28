import { Pool } from 'pg';
import config from './index';
import pino from 'pino';

const logger = pino({ level: config.logging.level });

let pool: Pool | null = null;
let dbConnected = false;

export function getConnection(): Pool {
  if (!pool) {
    pool = new Pool({
      host: config.db.host,
      port: config.db.port,
      database: config.db.name,
      user: config.db.user,
      password: config.db.password,
      ssl: config.db.ssl ? { rejectUnauthorized: false } : false,
      max: config.db.max,
      idleTimeoutMillis: config.db.idleTimeoutMillis,
      connectionTimeoutMillis: config.db.connectionTimeoutMillis,
    });

    pool.on('error', (err: Error) => {
      logger.warn('Database connection error:', err.message);
      dbConnected = false;
    });
    
    pool.on('connect', () => {
      logger.info('Database connected');
      dbConnected = true;
    });
    
    // Test connection asynchronously but don't block
    pool.query('SELECT NOW()').then(
      () => {
        logger.info('Database test connection successful');
        dbConnected = true;
      },
      (err) => {
        logger.warn('Database test connection failed (non-blocking):', err.message);
      }
    );
  }
  return pool;
}

export function isDatabaseConnected(): boolean {
  return dbConnected;
}

export async function query(text: string, params?: any[]): Promise<any> {
  const client = await getConnection().connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

export async function queryOne(text: string, params?: any[]): Promise<any> {
  const result = await query(text, params);
  return result.rows[0];
}

export async function queryMany(text: string, params?: any[]): Promise<any[]> {
  const result = await query(text, params);
  return result.rows;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

export default {
  getConnection,
  query,
  queryOne,
  queryMany,
  closePool,
};
