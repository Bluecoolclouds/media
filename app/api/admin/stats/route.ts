import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/stats - Get dashboard statistics
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const [
      totalUsers,
      totalGenerations,
      totalRevenue,
      activeSubscriptions,
      generationsByStatus,
      userGrowth,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.generation.count(),
      prisma.generation.aggregate({
        _sum: { cost: true },
      }),
      prisma.subscription.count({
        where: { status: 'ACTIVE' },
      }),
      prisma.generation.groupBy({
        by: ['status'],
        _count: true,
      }),
      // Get user registrations in the last 30 days
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    const statusBreakdown = generationsByStatus.reduce(
      (acc, curr) => {
        acc[curr.status.toLowerCase()] = curr._count;
        return acc;
      },
      {} as Record<string, number>
    );

    const stats = {
      users: {
        total: totalUsers,
        newThisMonth: userGrowth,
      },
      generations: {
        total: totalGenerations,
        byStatus: statusBreakdown,
      },
      revenue: {
        total: totalRevenue._sum.cost || 0,
      },
      subscriptions: {
        active: activeSubscriptions,
      },
    };

    return NextResponse.json(stats);
  } catch (error: any) {
    if (error.message === 'Unauthorized: You must be logged in to perform this action') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error.message === 'Forbidden: Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('GET /api/admin/stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
