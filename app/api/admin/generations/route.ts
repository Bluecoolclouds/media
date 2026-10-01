import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generationFilterSchema } from '@/lib/validations/generation.schema';
import { getPaginationParams, createPaginatedResponse } from '@/lib/pagination';

/**
 * GET /api/admin/generations - List all generations with filters
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const { skip, take, page, limit } = getPaginationParams(searchParams);

    const status = searchParams.get('status') || undefined;
    const userId = searchParams.get('userId') || undefined;
    const modelId = searchParams.get('modelId') || undefined;

    const validated = generationFilterSchema.parse({
      status,
      userId,
      modelId,
      page,
      limit,
    });

    const where: any = {};
    if (validated.status) where.status = validated.status;
    if (validated.userId) where.userId = validated.userId;
    if (validated.modelId) where.modelId = validated.modelId;

    const [generations, total] = await Promise.all([
      prisma.generation.findMany({
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

    const response = createPaginatedResponse(generations, total, page, limit);

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
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('GET /api/admin/generations error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
