import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createModelSchema } from '@/lib/validations/model.schema';
import { getPaginationParams, createPaginatedResponse } from '@/lib/pagination';
import { createAuditLog } from '@/app/actions/admin/logs';
import { clearModelsCache } from '@/lib/services/models';

/**
 * GET /api/admin/models - List all models with pagination
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin();
    const { searchParams } = new URL(request.url);
    const { skip, take, page, limit } = getPaginationParams(searchParams);

    const [models, total] = await Promise.all([
      prisma.model.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { generations: true },
          },
        },
      }),
      prisma.model.count(),
    ]);

    const response = createPaginatedResponse(models, total, page, limit);

    return NextResponse.json(response);
  } catch (error: any) {
    if (error.message === 'Unauthorized: You must be logged in to perform this action') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error.message === 'Forbidden: Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('GET /api/admin/models error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/models - Create a new model
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin();
    const body = await request.json();

    const validatedData = createModelSchema.parse(body);

    const model = await prisma.model.create({
      data: validatedData,
    });
    clearModelsCache();

    await createAuditLog({
      userId: user.id,
      action: 'MODEL_CREATED',
      resource: 'model',
      details: { modelId: model.id, modelName: model.name },
    });

    return NextResponse.json(model, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized: You must be logged in to perform this action') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error.message === 'Forbidden: Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('POST /api/admin/models error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
