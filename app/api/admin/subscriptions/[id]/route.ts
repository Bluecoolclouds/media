import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/app/actions/admin/logs';
import { subscriptionActionSchema, buildSubscriptionUpdate } from '../helpers';

/**
 * PATCH /api/admin/subscriptions/[id] - Cancel or extend a subscription
 * Body: { action: 'cancel' } | { action: 'extend', days?: number (1-365, default 30) }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const input = subscriptionActionSchema.parse(body);

    const existing = await prisma.subscription.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        plan: true,
        status: true,
        currentPeriodStart: true,
        currentPeriodEnd: true,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }
    if (input.action === 'cancel' && existing.status === 'CANCELLED') {
      return NextResponse.json({ error: 'Subscription is already cancelled' }, { status: 400 });
    }

    const subscription = await prisma.subscription.update({
      where: { id },
      data: buildSubscriptionUpdate(existing, input),
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    await createAuditLog({
      userId: admin.id,
      action: input.action === 'cancel' ? 'SUBSCRIPTION_CANCELLED' : 'SUBSCRIPTION_EXTENDED',
      resource: 'subscription',
      details: {
        subscriptionId: id,
        targetUserId: existing.userId,
        plan: existing.plan,
        previousStatus: existing.status,
        previousPeriodEnd: existing.currentPeriodEnd,
        newStatus: subscription.status,
        newPeriodEnd: subscription.currentPeriodEnd,
        ...(input.action === 'extend' ? { days: input.days } : {}),
      },
    });

    return NextResponse.json(subscription);
  } catch (error: any) {
    if (error.message === 'Unauthorized: You must be logged in to perform this action') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error.message === 'Forbidden: Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }
    console.error(`PATCH /api/admin/subscriptions/${id} error:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
