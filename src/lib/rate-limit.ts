import { logger } from './logger.js';

const RATE_LIMIT_PER_IP = parseInt(process.env.RATE_LIMIT_PER_IP || '30', 10);
const RATE_LIMIT_WINDOW_MS = getWindowMs(process.env.RATE_LIMIT_WINDOW || '1d');
const RATE_LIMIT_PER_MINUTE = parseInt(process.env.RATE_LIMIT_PER_MINUTE || '1', 10);
const MINUTE_MS = 60 * 1000;

interface RateLimitData {
  requests: number[];
  lastReset: number;
}

const store: Map<string, RateLimitData> = new Map();

function getWindowMs(window: string): number {
  switch (window) {
    case '1d':
      return 24 * 60 * 60 * 1000;
    case '1h':
      return 60 * 60 * 1000;
    default:
      return 24 * 60 * 60 * 1000;
  }
}

export function checkRateLimit(key: string): boolean {
  const now = Date.now();

  if (!store.has(key)) {
    store.set(key, { requests: [], lastReset: now });
  }

  let data = store.get(key)!;

  // Clean expired requests for the window
  data.requests = data.requests.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);

  // Check per-window limit
  if (data.requests.length >= RATE_LIMIT_PER_IP) {
    logger.error(`Rate limit exceeded for key "${key}": maximum ${RATE_LIMIT_PER_IP} requests per ${process.env.RATE_LIMIT_WINDOW || '1d'} exceeded.`);
    return false;
  }

  // Check per-minute limit
  const recentRequests = data.requests.filter((ts) => now - ts < MINUTE_MS);
  if (recentRequests.length >= RATE_LIMIT_PER_MINUTE) {
    logger.error(`Rate limit exceeded for key "${key}": maximum ${RATE_LIMIT_PER_MINUTE} requests per minute exceeded.`);
    return false;
  }

  // Add current request
  data.requests.push(now);
  store.set(key, data);

  return true;
}

// For CLI usage, use a default key or allow custom
export function checkCliRateLimit(cliKey?: string): boolean {
  const key = cliKey || 'cli-default-user';
  return checkRateLimit(key);
}

// Optional: Reset limit for a key (e.g., for testing)
export function resetRateLimit(key: string): void {
  store.delete(key);
}