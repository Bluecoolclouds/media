'use server';

import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Get dashboard statistics
 */
export async function getDashboardStats() {
  await requireAdmin();

  const [
    totalUsers,
    totalGenerations,
    totalRevenue,
    activeSubscriptions,
    recentGenerations,
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
    prisma.generation.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        model: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
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

  return {
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
    recentGenerations,
  };
}

/**
 * Get recent activity for the dashboard
 */
export async function getRecentActivity() {
  await requireAdmin();

  const [recentGenerations, recentUsers, recentLogs] = await Promise.all([
    prisma.generation.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        model: {
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    }),
    prisma.auditLog.findMany({
      take: 10,
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
  ]);

  return {
    recentGenerations,
    recentUsers,
    recentLogs,
  };
}
