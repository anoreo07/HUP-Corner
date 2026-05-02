/**
 * Simple in-memory rate limiter for uploads
 * Tracks number of uploads per IP address within a time window
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limit data
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup interval to remove expired entries (every 2 minutes)
if (typeof global !== 'undefined' && !(global as any).__rateLimiterCleanup) {
  (global as any).__rateLimiterCleanup = true;
  setInterval(() => {
    const now = Date.now();
    const entriesToDelete: string[] = [];
    rateLimitStore.forEach((entry, ip) => {
      if (entry.resetTime < now) {
        entriesToDelete.push(ip);
      }
    });
    entriesToDelete.forEach((ip) => rateLimitStore.delete(ip));
  }, 2 * 60 * 1000);
}

export interface RateLimitOptions {
  maxRequests: number; // Max number of requests allowed
  windowMs: number; // Time window in milliseconds
  message?: string; // Error message
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
  message?: string;
}

/**
 * Get client IP from request headers
 */
export function getClientIp(
  headers: Record<string, string | string[] | undefined>
): string {
  // Check for various IP headers (for different hosting environments)
  const forwarded = headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }

  const realIp = headers['x-real-ip'];
  if (typeof realIp === 'string') {
    return realIp;
  }

  const clientIp = headers['x-client-ip'];
  if (typeof clientIp === 'string') {
    return clientIp;
  }

  // Fallback
  return 'unknown';
}

/**
 * Check if request should be rate limited
 */
export function checkRateLimit(
  ip: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  // If no entry exists or entry has expired, create a new one
  if (!entry || entry.resetTime < now) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + options.windowMs,
    };
    rateLimitStore.set(ip, newEntry);

    return {
      success: true,
      remaining: options.maxRequests - 1,
      resetTime: newEntry.resetTime,
    };
  }

  // If limit exceeded
  if (entry.count >= options.maxRequests) {
    const resetIn = Math.ceil((entry.resetTime - now) / 1000);
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
      message:
        options.message ||
        `Rate limit exceeded. Try again in ${resetIn} seconds.`,
    };
  }

  // Increment counter
  entry.count++;
  return {
    success: true,
    remaining: options.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Preset configurations
 */
export const RATE_LIMITS = {
  UPLOAD: {
    maxRequests: 50,
    windowMs: 1 * 60 * 1000, // 1 minute
    message: 'Quá nhiều yêu cầu upload. Vui lòng chờ 1 phút trước khi tiếp tục.',
  },
  API_GENERAL: {
    maxRequests: 100,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: 'Quá nhiều yêu cầu. Vui lòng chờ một lúc.',
  },
} as const;
