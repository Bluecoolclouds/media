'use server';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-utils';

export async function getDashboardStats(days: number = 30) {
  const { error: authError } = await requireAdmin();
  if (authError) {
    throw new Error('Unauthorized');
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Overall counts
  const [
    totalUsers,
    totalModels,
    totalGenerations,
    activeModels,
    recentUsers,
    recentGenerations,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.model.count(),
    prisma.generation.count(),
    prisma.model.count({ where: { isActive: true } }),
    prisma.user.count({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    }),
    prisma.generation.count({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    }),
  ]);

  // Generation status breakdown
  const generationsByStatus = await prisma.generation.groupBy({
    by: ['status'],
    _count: {
      status: true,
    },
    where: {
      createdAt: {
        gte: startDate,
      },
    },
  });

  // Generations by model (top 10)
  const generationsByModel = await prisma.generation.groupBy({
    by: ['modelId'],
    _count: {
      modelId: true,
    },
    where: {
      createdAt: {
        gte: startDate,
      },
    },
    orderBy: {
      _count: {
        modelId: 'desc',
      },
    },
    take: 10,
  });

  // Fetch model names
  const modelIds = generationsByModel.map((g) => g.modelId);
  const models = await prisma.model.findMany({
    where: {
      id: {
        in: modelIds,
      },
    },
    select: {
      id: true,
      name: true,
    },
  });

  const modelMap = Object.fromEntries(models.map((m) => [m.id, m.name]));

  // Top users by generation count
  const topUsers = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      _count: {
        select: { generations: true },
      },
    },
    orderBy: {
      generations: {
        _count: 'desc',
      },
    },
    take: 10,
  });

  return {
    overview: {
      totalUsers,
      totalModels,
      totalGenerations,
      activeModels,
      recentUsers,
      recentGenerations,
    },
    generationsByStatus: generationsByStatus.map((g) => ({
      status: g.status,
      count: g._count.status,
    })),
    generationsByModel: generationsByModel.map((g) => ({
      modelId: g.modelId,
      modelName: modelMap[g.modelId] || 'Unknown',
      count: g._count.modelId,
    })),
    topUsers: topUsers.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      generationsCount: u._count.generations,
    })),
    period: {
      days,
      startDate,
      endDate: new Date(),
    },
  };
}

export async function getRecentActivity(limit: number = 20) {
  const { error: authError } = await requireAdmin();
  if (authError) {
    throw new Error('Unauthorized');
  }

  const recentActivity = await prisma.generation.findMany({
    take: limit,
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
  });

  return recentActivity;
}

export async function getDailyGenerations(days: number = 30) {
  const { error: authError } = await requireAdmin();
  if (authError) {
    throw new Error('Unauthorized');
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const dailyGenerations = await prisma.$queryRaw<
    Array<{ date: Date; count: bigint }>
  >`
    SELECT
      DATE(created_at) as date,
      COUNT(*)::bigint as count
    FROM generations
    WHERE created_at >= ${startDate}
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `;

  return dailyGenerations.map((d) => ({
    date: d.date,
    count: Number(d.count),
  }));
}

export async function getSystemHealth() {
  const { error: authError } = await requireAdmin();
  if (authError) {
    throw new Error('Unauthorized');
  }

  // Check for failed generations in the last 24 hours
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const [pendingGenerations, failedGenerations, processingGenerations] = await Promise.all([
    prisma.generation.count({
      where: {
        status: 'PENDING',
        createdAt: {
          gte: yesterday,
        },
      },
    }),
    prisma.generation.count({
      where: {
        status: 'FAILED',
        createdAt: {
          gte: yesterday,
        },
      },
    }),
    prisma.generation.count({
      where: {
        status: 'PROCESSING',
      },
    }),
  ]);

  const totalGenerations = await prisma.generation.count({
    where: {
      createdAt: {
        gte: yesterday,
      },
    },
  });

  const failureRate = totalGenerations > 0 ? (failedGenerations / totalGenerations) * 100 : 0;

  return {
    pendingGenerations,
    failedGenerations,
    processingGenerations,
    totalGenerations,
    failureRate: Math.round(failureRate * 100) / 100,
    period: {
      startDate: yesterday,
      endDate: new Date(),
    },
  };
}
