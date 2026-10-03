// Fixed-window in-memory rate limiter.
// Per-process only: with several server instances, replace the store with Redis.
const buckets = new Map();
const MAX_BUCKETS = 10_000;

export function rateLimit(key, { limit, windowMs }, now = Date.now()) {
  let bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    if (buckets.size >= MAX_BUCKETS) pruneExpired(now);
    bucket = { count: 0, resetAt: now + windowMs };
    buckets.set(key, bucket);
  }

  bucket.count += 1;
  const allowed = bucket.count <= limit;

  return {
    allowed,
    remaining: Math.max(0, limit - bucket.count),
    retryAfterSec: allowed ? 0 : Math.ceil((bucket.resetAt - now) / 1000),
  };
}

function pruneExpired(now) {
  for (const [key, bucket] of buckets) {
    if (now >= bucket.resetAt) buckets.delete(key);
  }
}

export function clientIp(headers) {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return headers.get('x-real-ip') || 'unknown';
}

export function resetRateLimits() {
  buckets.clear();
}
