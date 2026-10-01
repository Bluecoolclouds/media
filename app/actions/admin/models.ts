'use server';

import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createModelSchema, updateModelSchema } from '@/lib/validations/model.schema';
import type { CreateModelInput, UpdateModelInput } from '@/lib/validations/model.schema';
import { createAuditLog } from './logs';
import { revalidatePath } from 'next/cache';

/**
 * Get all models with pagination
 */
export async function getModels(page = 1, limit = 10) {
  const user = await requireAdmin();

  const skip = (page - 1) * limit;
  const [models, total] = await Promise.all([
    prisma.model.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { generations: true },
        },
      },
    }),
    prisma.model.count(),
  ]);

  return {
    models,
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
 * Get a single model by ID
 */
export async function getModel(id: string) {
  await requireAdmin();

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

/**
 * Create a new model
 */
export async function createModel(input: CreateModelInput) {
  const user = await requireAdmin();

  const validatedData = createModelSchema.parse(input);

  const model = await prisma.model.create({
    data: {
      ...validatedData,
      parameters: validatedData.parameters as any,
    },
  });

  await createAuditLog({
    userId: user.id,
    action: 'MODEL_CREATED',
    resource: 'model',
    details: { modelId: model.id, modelName: model.name },
  });

  revalidatePath('/admin/models');

  return model;
}

/**
 * Update an existing model
 */
export async function updateModel(id: string, input: UpdateModelInput) {
  const user = await requireAdmin();

  const validatedData = updateModelSchema.parse(input);

  const model = await prisma.model.update({
    where: { id },
    data: {
      ...validatedData,
      parameters: validatedData.parameters as any,
    },
  });

  await createAuditLog({
    userId: user.id,
    action: 'MODEL_UPDATED',
    resource: 'model',
    details: { modelId: model.id, modelName: model.name, changes: input },
  });

  revalidatePath('/admin/models');
  revalidatePath(`/admin/models/${id}`);

  return model;
}

/**
 * Delete a model
 */
export async function deleteModel(id: string) {
  const user = await requireAdmin();

  const model = await prisma.model.findUnique({
    where: { id },
    select: { id: true, name: true },
  });

  if (!model) {
    throw new Error('Model not found');
  }

  await prisma.model.delete({
    where: { id },
  });

  await createAuditLog({
    userId: user.id,
    action: 'MODEL_DELETED',
    resource: 'model',
    details: { modelId: id, modelName: model.name },
  });

  revalidatePath('/admin/models');

  return { success: true, message: 'Model deleted successfully' };
}

/**
 * Toggle model active status
 */
export async function toggleModelStatus(id: string) {
  const user = await requireAdmin();

  const currentModel = await prisma.model.findUnique({
    where: { id },
    select: { isActive: true, name: true },
  });

  if (!currentModel) {
    throw new Error('Model not found');
  }

  const model = await prisma.model.update({
    where: { id },
    data: { isActive: !currentModel.isActive },
  });

  await createAuditLog({
    userId: user.id,
    action: 'MODEL_STATUS_TOGGLED',
    resource: 'model',
    details: {
      modelId: id,
      modelName: model.name,
      newStatus: model.isActive ? 'active' : 'inactive',
    },
  });

  revalidatePath('/admin/models');
  revalidatePath(`/admin/models/${id}`);

  return model;
}
