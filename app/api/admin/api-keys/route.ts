import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getPaginationParams, createPaginatedResponse } from '@/lib/pagination';
import { apiKeyFiltersSchema, buildApiKeyWhere, toPublicApiKey } from './helpers';

/**
 * GET /api/admin/api-keys - List API keys (masked) with owner info.
 * The raw `key` is selected only to build the mask and is never returned.
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const { skip, take, page, limit } = getPaginationParams(searchParams);

    const filters = apiKeyFiltersSchema.parse({
      status: searchParams.get('status') || undefined,
      search: searchParams.get('search') || undefined,
    });
    const where = buildApiKeyWhere(filters);

    const [apiKeys, total] = await Promise.all([
      prisma.apiKey.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          key: true,
          isActive: true,
          lastUsed: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.apiKey.count({ where }),
    ]);

    const response = createPaginatedResponse(apiKeys.map(toPublicApiKey), total, page, limit);

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
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('GET /api/admin/api-keys error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
