import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateModelSchema } from '@/lib/validations/model.schema';
import { createAuditLog } from '@/app/actions/admin/logs';

/**
 * GET /api/admin/models/[id] - Get a single model
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
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
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    return NextResponse.json(model);
  } catch (error: any) {
    if (error.message === 'Unauthorized: You must be logged in to perform this action') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error.message === 'Forbidden: Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error(`GET /api/admin/models/${id} error:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/models/[id] - Update a model
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const user = await requireAdmin();
    const body = await request.json();

    const validatedData = updateModelSchema.parse(body);

    const model = await prisma.model.update({
      where: { id },
      data: validatedData,
    });

    await createAuditLog({
      userId: user.id,
      action: 'MODEL_UPDATED',
      resource: 'model',
      details: { modelId: model.id, modelName: model.name, changes: body },
    });

    return NextResponse.json(model);
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
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }
    console.error(`PATCH /api/admin/models/${id} error:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/models/[id] - Delete a model
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const user = await requireAdmin();

    const model = await prisma.model.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!model) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
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

    return NextResponse.json({
      success: true,
      message: 'Model deleted successfully',
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized: You must be logged in to perform this action') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error.message === 'Forbidden: Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }
    console.error(`DELETE /api/admin/models/${id} error:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
