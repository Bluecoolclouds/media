import { z } from 'zod';

export const SUBSCRIPTION_PLANS = ['FREE', 'PRO', 'ENTERPRISE'];
export const SUBSCRIPTION_STATUSES = ['ACTIVE', 'CANCELLED', 'EXPIRED'];

const DAY_MS = 24 * 60 * 60 * 1000;

export const subscriptionFiltersSchema = z.object({
  status: z.enum(SUBSCRIPTION_STATUSES).optional(),
  plan: z.enum(SUBSCRIPTION_PLANS).optional(),
  search: z.string().trim().max(255).optional(),
});

export const subscriptionActionSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('cancel') }),
  z.object({
    action: z.literal('extend'),
    days: z.coerce.number().int().min(1).max(365).default(30),
  }),
]);

/**
 * Prisma `where` for the admin subscriptions list.
 * @param {{ status?: string, plan?: string, search?: string }} filters
 * @returns {import('@prisma/client').Prisma.SubscriptionWhereInput}
 */
export function buildSubscriptionWhere({ status, plan, search }) {
  const where = {};
  if (status) where.status = status;
  if (plan) where.plan = plan;
  if (search) where.user = { email: { contains: search, mode: 'insensitive' } };
  return where;
}

/**
 * Prisma `data` for a cancel/extend action.
 * - cancel: immediately marks the subscription CANCELLED.
 * - extend: pushes currentPeriodEnd forward by `days`, counted from the later of
 *   now and the current end (so an expired subscription doesn't stay in the past),
 *   and reactivates it.
 * @param {{ currentPeriodStart?: Date | null, currentPeriodEnd?: Date | null }} subscription
 * @param {{ action: 'cancel' } | { action: 'extend', days: number }} input
 * @param {Date} [now]
 * @returns {import('@prisma/client').Prisma.SubscriptionUpdateInput}
 */
export function buildSubscriptionUpdate(subscription, input, now = new Date()) {
  if (input.action === 'cancel') {
    return { status: 'CANCELLED', cancelAtPeriodEnd: false };
  }

  const currentEnd = subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd) : null;
  const base = currentEnd && currentEnd > now ? currentEnd : now;
  return {
    status: 'ACTIVE',
    cancelAtPeriodEnd: false,
    currentPeriodStart: subscription.currentPeriodStart ?? now,
    currentPeriodEnd: new Date(base.getTime() + input.days * DAY_MS),
  };
}
