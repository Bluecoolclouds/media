'use server';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';
import { createModelSchema, updateModelSchema } from '@/lib/validations/admin';

export async function createModel(data: unknown) {
  const { error: authError } = await requireAdmin();
  if (authError) {
    throw new Error('Unauthorized');
  }

  const validation = createModelSchema.safeParse(data);
  if (!validation.success) {
    throw new Error('Invalid input: ' + validation.error.issues[0].message);
  }

  const validated = validation.data;

  // Check if name already exists
  const existingModel = await prisma.model.findUnique({
    where: { name: validated.name },
  });

  if (existingModel) {
    throw new Error('Model with this name already exists');
  }

  const model = await prisma.model.create({
    data: {
      ...validated,
      parameters: validated.parameters as any,
    },
  });

  revalidatePath('/admin/models');
  return model;
}

export async function updateModel(id: string, data: unknown) {
  const { error: authError } = await requireAdmin();
  if (authError) {
    throw new Error('Unauthorized');
  }

  const validation = updateModelSchema.safeParse(data);
  if (!validation.success) {
    throw new Error('Invalid input: ' + validation.error.issues[0].message);
  }

  const validated = validation.data;

  // Check if model exists
  const existingModel = await prisma.model.findUnique({
    where: { id },
  });

  if (!existingModel) {
    throw new Error('Model not found');
  }

  // If name is being updated, check for conflicts
  if (validated.name && validated.name !== existingModel.name) {
    const nameConflict = await prisma.model.findUnique({
      where: { name: validated.name },
    });

    if (nameConflict) {
      throw new Error('Model with this name already exists');
    }
  }

  const model = await prisma.model.update({
    where: { id },
    data: validated as any,
  });

  revalidatePath('/admin/models');
  revalidatePath(`/admin/models/${id}`);
  return model;
}

export async function deleteModel(id: string) {
  const { error: authError } = await requireAdmin();
  if (authError) {
    throw new Error('Unauthorized');
  }

  // Check if model exists and has generations
  const existingModel = await prisma.model.findUnique({
    where: { id },
    include: {
      _count: {
        select: { generations: true },
      },
    },
  });

  if (!existingModel) {
    throw new Error('Model not found');
  }

  if (existingModel._count.generations > 0) {
    throw new Error(
      `Cannot delete model with existing generations (${existingModel._count.generations} generations)`
    );
  }

  await prisma.model.delete({
    where: { id },
  });

  revalidatePath('/admin/models');
  return { success: true };
}

export async function toggleModelActive(id: string) {
  const { error: authError } = await requireAdmin();
  if (authError) {
    throw new Error('Unauthorized');
  }

  const existingModel = await prisma.model.findUnique({
    where: { id },
  });

  if (!existingModel) {
    throw new Error('Model not found');
  }

  const model = await prisma.model.update({
    where: { id },
    data: {
      isActive: !existingModel.isActive,
    },
  });

  revalidatePath('/admin/models');
  revalidatePath(`/admin/models/${id}`);
  return model;
}

export async function getModelById(id: string) {
  const { error: authError } = await requireAdmin();
  if (authError) {
    throw new Error('Unauthorized');
  }

  const model = await prisma.model.findUnique({
    where: { id },
    include: {
      _count: {
        select: { generations: true },
      },
    },
  });

  if (!model) {
    throw new Error('Model not found');
  }

  return model;
}

export async function getModels(params?: {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  isActive?: boolean;
}) {
  const { error: authError } = await requireAdmin();
  if (authError) {
    throw new Error('Unauthorized');
  }

  const page = params?.page || 1;
  const limit = params?.limit || 10;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (params?.search) {
    where.OR = [
      { name: { contains: params.search, mode: 'insensitive' } },
      { category: { contains: params.search, mode: 'insensitive' } },
      { provider: { contains: params.search, mode: 'insensitive' } },
    ];
  }

  if (params?.type) {
    where.type = params.type;
  }

  if (params?.isActive !== undefined) {
    where.isActive = params.isActive;
  }

  const [models, total] = await Promise.all([
    prisma.model.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { generations: true },
        },
      },
    }),
    prisma.model.count({ where }),
  ]);

  return {
    models,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
