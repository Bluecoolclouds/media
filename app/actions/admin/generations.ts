'use server';

import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generationFilterSchema } from '@/lib/validations/generation.schema';

/**
 * Get all generations with filters and pagination
 */
export async function getGenerations(params: {
  page?: number;
  limit?: number;
  status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  userId?: string;
  modelId?: string;
}) {
  await requireAdmin();

  const validated = generationFilterSchema.parse(params);
  const { page = 1, limit = 10, status, userId, modelId } = validated;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (status) where.status = status;
  if (userId) where.userId = userId;
  if (modelId) where.modelId = modelId;

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
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    },
  };
}

/**
 * Get generation statistics
 */
export async function getGenerationStats() {
  await requireAdmin();

  const [
    totalGenerations,
    completedGenerations,
    failedGenerations,
    pendingGenerations,
    totalCost,
    generationsByModel,
  ] = await Promise.all([
    prisma.generation.count(),
    prisma.generation.count({ where: { status: 'COMPLETED' } }),
    prisma.generation.count({ where: { status: 'FAILED' } }),
    prisma.generation.count({
      where: { status: { in: ['PENDING', 'PROCESSING'] } },
    }),
    prisma.generation.aggregate({
      _sum: { cost: true },
    }),
    prisma.generation.groupBy({
      by: ['modelId'],
      _count: true,
      orderBy: {
        _count: {
          modelId: 'desc',
        },
      },
      take: 5,
    }),
  ]);

  // Get model details for the top models
  const modelIds = generationsByModel.map((g) => g.modelId);
  const models = await prisma.model.findMany({
    where: { id: { in: modelIds } },
    select: { id: true, name: true },
  });

  const topModels = generationsByModel.map((g) => ({
    model: models.find((m) => m.id === g.modelId),
    count: g._count,
  }));

  return {
    total: totalGenerations,
    completed: completedGenerations,
    failed: failedGenerations,
    pending: pendingGenerations,
    totalCost: totalCost._sum.cost || 0,
    topModels,
  };
}
