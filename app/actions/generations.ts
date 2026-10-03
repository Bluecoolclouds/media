'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

/**
 * Non-admins may only ever see their own generations, regardless of the
 * userId the client sends. Admins may filter by any userId (or none).
 */
function scopeUserId(user: { id?: string; role?: string }, requested?: string) {
  if (user.role === 'ADMIN') return requested;
  return user.id;
}

export async function getGenerations(params?: {
  page?: number;
  limit?: number;
  userId?: string;
  modelId?: string;
  status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  startDate?: Date;
  endDate?: Date;
}) {
  const user = await requireAuth();

  const page = params?.page || 1;
  const limit = params?.limit || 10;
  const skip = (page - 1) * limit;

  const where: any = {};

  const userId = scopeUserId(user, params?.userId);
  if (userId) {
    where.userId = userId;
  }

  if (params?.modelId) {
    where.modelId = params.modelId;
  }

  if (params?.status) {
    where.status = params.status;
  }

  if (params?.startDate || params?.endDate) {
    where.createdAt = {};
    if (params.startDate) {
      where.createdAt.gte = params.startDate;
    }
    if (params.endDate) {
      where.createdAt.lte = params.endDate;
    }
  }

  const [generations, total] = await Promise.all([
    prisma.generation.findMany({
      where,
      skip,
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
    }),
    prisma.generation.count({ where }),
  ]);

  return {
    generations,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getGenerationStats(params?: {
  userId?: string;
  days?: number;
}) {
  const user = await requireAuth();

  const days = params?.days || 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const where: any = {
    createdAt: {
      gte: startDate,
    },
  };

  const userId = scopeUserId(user, params?.userId);
  if (userId) {
    where.userId = userId;
  }

  const [totalGenerations, byStatus, byModel] = await Promise.all([
    prisma.generation.count({ where }),
    prisma.generation.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
      where,
    }),
    prisma.generation.groupBy({
      by: ['modelId'],
      _count: {
        modelId: true,
      },
      where,
      orderBy: {
        _count: {
          modelId: 'desc',
        },
      },
      take: 10,
    }),
  ]);

  // Fetch model names
  const modelIds = byModel.map((g) => g.modelId);
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

  return {
    total: totalGenerations,
    byStatus: byStatus.map((g) => ({
      status: g.status,
      count: g._count.status,
    })),
    byModel: byModel.map((g) => ({
      modelId: g.modelId,
      modelName: modelMap[g.modelId] || 'Unknown',
      count: g._count.modelId,
    })),
    period: {
      days,
      startDate,
      endDate: new Date(),
    },
  };
}

export async function getGenerationById(id: string) {
  const user = await requireAuth();

  const generation = await prisma.generation.findUnique({
    where: { id },
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
          endpoint: true,
        },
      },
    },
  });

  // Same error for "missing" and "not yours" so ids can't be probed.
  if (!generation || (user.role !== 'ADMIN' && generation.userId !== user.id)) {
    throw new Error('Generation not found');
  }

  return generation;
}
