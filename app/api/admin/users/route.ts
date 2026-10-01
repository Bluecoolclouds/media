import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createUserSchema } from '@/lib/validations/user.schema';
import { getPaginationParams, createPaginatedResponse } from '@/lib/pagination';
import { hashPassword } from '@/lib/auth';
import { createAuditLog } from '@/app/actions/admin/logs';

/**
 * GET /api/admin/users - List all users with pagination and search
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin();
    const { searchParams } = new URL(request.url);
    const { skip, take, page, limit } = getPaginationParams(searchParams);

    const search = searchParams.get('search') || undefined;
    const role = searchParams.get('role') as 'USER' | 'ADMIN' | undefined;

    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
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
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const response = createPaginatedResponse(users, total, page, limit);

    return NextResponse.json(response);
  } catch (error: any) {
    if (error.message === 'Unauthorized: You must be logged in to perform this action') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error.message === 'Forbidden: Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('GET /api/admin/users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/users - Create a new user
 */
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();

    const validatedData = createUserSchema.parse(body);

    // Hash the password
    const hashedPassword = await hashPassword(validatedData.password);

    const user = await prisma.user.create({
      data: {
        ...validatedData,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await createAuditLog({
      userId: admin.id,
      action: 'USER_CREATED',
      resource: 'user',
      details: { targetUserId: user.id, targetUserEmail: user.email },
    });

    return NextResponse.json(user, { status: 201 });
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
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 400 }
      );
    }
    console.error('POST /api/admin/users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
