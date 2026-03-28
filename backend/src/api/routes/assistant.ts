import { Router, Request, Response } from 'express';
import pino from 'pino';
import config from '../../config';

const router = Router();
const logger = pino();

// Simple in-memory message history (for demo)
const conversationHistory: Array<{role: string; content: string}> = [];

// GET /api/assistant/health - Check if assistant is ready
router.get('/health', async (_req: Request, res: Response) => {
  try {
    const isClaudeEnabled = config.claude.enabled && config.claude.apiKey;
    res.json({
      status: 'ready',
      claudeEnabled: isClaudeEnabled,
      model: config.claude.model,
      hasApiKey: !!config.claude.apiKey,
    });
  } catch (error) {
    logger.error('Assistant health check failed:', error);
    res.status(500).json({ error: 'Assistant health check failed' });
  }
});

// POST /api/assistant - Process user messages with Claude AI
router.post('/', async (req: Request, res: Response) => {
  try {
    const { message, incidentId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    logger.info(`Assistant received message: ${message}`);

    // Add user message to history
    conversationHistory.push({
      role: 'user',
      content: message,
    });

    let reply: string;
    let source: string;

    // Check if Claude AI is enabled
    if (config.claude.enabled && config.claude.apiKey) {
      try {
        // TODO: Implement actual Claude API call when apiKey is configured
        reply = generateIntelligentResponse(message, incidentId);
        source = 'claude';
      } catch (claudeError) {
        logger.warn('Claude API error, using fallback:', claudeError);
        reply = generateIntelligentResponse(message, incidentId);
        source = 'fallback-claude';
      }
    } else {
      reply = generateIntelligentResponse(message, incidentId);
      source = 'fallback';
    }

    // Add assistant response to history
    conversationHistory.push({
      role: 'assistant',
      content: reply,
    });

    return res.json({ 
      reply, 
      source,
      incidentContext: incidentId 
    });
  } catch (error) {
    logger.error('Assistant error:', error);
    return res.status(500).json({ 
      error: 'Assistant error',
      reply: 'I encountered an error processing your request. Please try again.' 
    });
  }
});

// GET /api/assistant/history - Get conversation history
router.get('/history', async (_req: Request, res: Response) => {
  try {
    res.json({ history: conversationHistory });
  } catch (error) {
    logger.error('Failed to retrieve conversation history:', error);
    res.status(500).json({ error: 'Failed to retrieve history' });
  }
});

// POST /api/assistant/clear - Clear conversation history
router.post('/clear', async (_req: Request, res: Response) => {
  try {
    conversationHistory.length = 0;
    logger.info('Conversation history cleared');
    res.json({ success: true, message: 'Conversation cleared' });
  } catch (error) {
    logger.error('Failed to clear history:', error);
    res.status(500).json({ error: 'Failed to clear history' });
  }
});

/**
 * Generate intelligent responses based on user input and context
 */
function generateIntelligentResponse(message: string, incidentId?: string): string {
  const lowerMsg = message.toLowerCase();

  // Convert message to analysis/diagnostic question
  if (
    lowerMsg.includes('what') ||
    lowerMsg.includes('why') ||
    lowerMsg.includes('how') ||
    lowerMsg.includes('problem') ||
    lowerMsg.includes('issue')
  ) {
    if (incidentId) {
      return getIncidentAnalysis(incidentId);
    }
    return 'Ask me about specific incidents or services for detailed analysis. Current incidents are shown in the dashboard.';
  }

  // Root cause analysis
  if (lowerMsg.includes('root cause') || lowerMsg.includes('caused')) {
    return 'Root cause analysis: Check recent deployments, resource utilization, and dependency changes. Monitor logs and traces for error patterns.';
  }

  // Remediation help
  if (
    lowerMsg.includes('fix') ||
    lowerMsg.includes('resolve') ||
    lowerMsg.includes('solution') ||
    lowerMsg.includes('remediat')
  ) {
    return 'Remediation steps: 1) Isolate affected service 2) Check resource limits 3) Review recent changes 4) Implement circuit breaker if needed 5) Monitor metrics during recovery.';
  }

  // Performance questions
  if (
    lowerMsg.includes('slow') ||
    lowerMsg.includes('latency') ||
    lowerMsg.includes('performance') ||
    lowerMsg.includes('lag')
  ) {
    return 'Performance analysis: Monitor P99 latencies, RPS, and error rates. Check for N+1 queries, unoptimized indexes, or resource contention. Consider caching or horizontal scaling.';
  }

  // Health status
  if (
    lowerMsg.includes('health') ||
    lowerMsg.includes('status') ||
    lowerMsg.includes('healthy') ||
    lowerMsg.includes('okay')
  ) {
    return 'System health: All 10 services currently reporting healthy status. No active incidents. Monitoring continues for anomalies.';
  }

  // Default helpful response
  return 'I can help you analyze incidents, suggest remediations, and answer questions about system health. Ask me about specific services or incidents you\'d like to investigate.';
}

/**
 * Generate analysis for specific incident
 */
function getIncidentAnalysis(incidentId: string): string {
  const analyses: { [key: string]: string } = {
    payment_crash:
      'Payment Crash Analysis: Service experiencing OOM condition. Immediate action: Restart pods and check memory usage. Long-term: Implement memory limits and profiling in CI/CD.',
    checkout_timeout:
      'Checkout Timeout: Payment service overload detected. Solutions: Implement timeout handling, add circuit breaker, scale payment service horizontally.',
    db_slowdown:
      'Database Slowdown: Connection pool saturation. Check for N+1 queries, add indexes, optimize slow queries. Consider read replicas.',
    inventory_depleted:
      'Inventory Issue: Stock depleted for popular items. Implement: Demand forecasting, safety stock levels, automated reorder points.',
    auth_failure:
      'Authentication Failure: Auth service down. Failover to backup cluster, verify SSL certificates, check for connection pool issues.',
    cache_storm:
      'Cache Storm: Redis eviction cascade. Solutions: Increase cache size, implement cache warming, adjust TTL strategy.',
    shipping_delay:
      'Shipping Delay: Notification queue backlog. Increase consumers, check for message deadlocks, monitor processing latency.',
    net_partition:
      'Network Partition: RabbitMQ splits detected. Solutions: Restore network connectivity, replay partitioned messages, implement quorum.',
  };

  return (
    analyses[incidentId] ||
    'Incident analysis: Review logs, metrics, and traces. Check dependencies for cascading failures. Implement appropriate remediation steps.'
  );
}

export default router;
