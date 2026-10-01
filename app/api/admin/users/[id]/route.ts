import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateUserSchema } from '@/lib/validations/user.schema';
import { createAuditLog } from '@/app/actions/admin/logs';

/**
 * GET /api/admin/users/[id] - Get a single user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await requireAdmin();

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            generations: true,
            apiKeys: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error: any) {
    if (error.message === 'Unauthorized: You must be logged in to perform this action') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error.message === 'Forbidden: Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error(`GET /api/admin/users/${id} error:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/users/[id] - Update user role or status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const admin = await requireAdmin();
    const body = await request.json();

    const validatedData = updateUserSchema.parse(body);

    // Prevent admin from demoting themselves
    if (admin.id === id && validatedData.role && validatedData.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'You cannot change your own role' },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id },
      data: validatedData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        updatedAt: true,
      },
    });

    await createAuditLog({
      userId: admin.id,
      action: 'USER_UPDATED',
      resource: 'user',
      details: { targetUserId: id, changes: body },
    });

    return NextResponse.json(user);
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
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    console.error(`PATCH /api/admin/users/${id} error:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users/[id] - Delete a user
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const admin = await requireAdmin();

    // Prevent admin from deleting themselves
    if (admin.id === id) {
      return NextResponse.json(
        { error: 'You cannot delete your own account' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await prisma.user.delete({
      where: { id },
    });

    await createAuditLog({
      userId: admin.id,
      action: 'USER_DELETED',
      resource: 'user',
      details: { targetUserId: id, targetUserEmail: user.email },
    });

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized: You must be logged in to perform this action') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error.message === 'Forbidden: Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    console.error(`DELETE /api/admin/users/${id} error:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
