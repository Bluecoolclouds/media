import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/app/actions/admin/logs';
import { toPublicApiKey } from '../helpers';

/**
 * DELETE /api/admin/api-keys/[id] - Revoke an API key.
 * Soft revoke (isActive = false) so the key stays visible in history and audit trail.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const admin = await requireAdmin();

    const existing = await prisma.apiKey.findUnique({
      where: { id },
      select: { id: true, name: true, userId: true, isActive: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }
    if (!existing.isActive) {
      return NextResponse.json({ error: 'API key is already revoked' }, { status: 400 });
    }

    const apiKey = await prisma.apiKey.update({
      where: { id },
      data: { isActive: false },
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
    });

    await createAuditLog({
      userId: admin.id,
      action: 'API_KEY_REVOKED',
      resource: 'api_key',
      details: { apiKeyId: id, apiKeyName: existing.name, targetUserId: existing.userId },
    });

    return NextResponse.json(toPublicApiKey(apiKey));
  } catch (error: any) {
    if (error.message === 'Unauthorized: You must be logged in to perform this action') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error.message === 'Forbidden: Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }
    console.error(`DELETE /api/admin/api-keys/${id} error:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
