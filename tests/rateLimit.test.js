import test from 'node:test';
import assert from 'node:assert/strict';
import { rateLimit, clientIp, resetRateLimits } from '../lib/rateLimit.js';

const opts = { limit: 3, windowMs: 60_000 };

test('rateLimit allows up to the limit, then blocks', () => {
  resetRateLimits();
  const t = 1_000_000;
  assert.equal(rateLimit('a', opts, t).allowed, true);
  assert.equal(rateLimit('a', opts, t).allowed, true);
  assert.equal(rateLimit('a', opts, t).remaining, 0);
  const blocked = rateLimit('a', opts, t + 1000);
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.retryAfterSec, 59);
});

test('rateLimit resets after the window and isolates keys', () => {
  resetRateLimits();
  const t = 2_000_000;
  for (let i = 0; i < 4; i++) rateLimit('b', opts, t);
  assert.equal(rateLimit('c', opts, t).allowed, true);
  assert.equal(rateLimit('b', opts, t + 60_000).allowed, true);
});

test('clientIp prefers first x-forwarded-for entry', () => {
  const h = new Headers({ 'x-forwarded-for': '1.2.3.4, 10.0.0.1', 'x-real-ip': '9.9.9.9' });
  assert.equal(clientIp(h), '1.2.3.4');
  assert.equal(clientIp(new Headers({ 'x-real-ip': '9.9.9.9' })), '9.9.9.9');
  assert.equal(clientIp(new Headers()), 'unknown');
});
