import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getPaginationParams, createPaginatedResponse } from '@/lib/pagination';
import { subscriptionFiltersSchema, buildSubscriptionWhere } from './helpers';

/**
 * GET /api/admin/subscriptions - List subscriptions with pagination,
 * status/plan filters and search by user email
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const { skip, take, page, limit } = getPaginationParams(searchParams);

    const filters = subscriptionFiltersSchema.parse({
      status: searchParams.get('status') || undefined,
      plan: searchParams.get('plan') || undefined,
      search: searchParams.get('search') || undefined,
    });
    const where = buildSubscriptionWhere(filters);

    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.subscription.count({ where }),
    ]);

    const response = createPaginatedResponse(subscriptions, total, page, limit);

    return NextResponse.json(response);
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
    console.error('GET /api/admin/subscriptions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
