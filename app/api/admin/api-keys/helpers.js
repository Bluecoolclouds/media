import { z } from 'zod';

export const apiKeyFiltersSchema = z.object({
  status: z.enum(['active', 'revoked']).optional(),
  search: z.string().trim().max(255).optional(),
});

/**
 * Mask an API key for display: keep a short prefix and the last 4 chars.
 * Short keys are fully hidden so nothing meaningful leaks.
 */
export function maskApiKey(key) {
  if (typeof key !== 'string' || key.length === 0) return '';
  if (key.length <= 12) return '••••••••';
  return `${key.slice(0, 4)}••••••••${key.slice(-4)}`;
}

/** Replace the raw `key` with `maskedKey`. The raw value never leaves the server. */
export function toPublicApiKey({ key, ...rest }) {
  return { ...rest, maskedKey: maskApiKey(key) };
}

/**
 * Prisma `where` for the admin API keys list.
 * @param {{ status?: string, search?: string }} filters
 * @returns {import('@prisma/client').Prisma.ApiKeyWhereInput}
 */
export function buildApiKeyWhere({ status, search }) {
  const where = {};
  if (status === 'active') where.isActive = true;
  if (status === 'revoked') where.isActive = false;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
    ];
  }
  return where;
}
