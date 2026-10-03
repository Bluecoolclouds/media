'use server';

import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface CreateAuditLogInput {
  /** Ignored: the entry is always attributed to the calling admin. */
  userId?: string;
  action: string;
  resource: string;
  details?: Record<string, any>;
}

/**
 * Create an audit log entry.
 *
 * Exported from a 'use server' module, so it is a client-callable endpoint:
 * it requires an admin session and always attributes the entry to that admin,
 * ignoring any client-supplied userId, so logs can't be forged.
 */
export async function createAuditLog(input: CreateAuditLogInput) {
  const admin = await requireAdmin();

  try {
    const log = await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: input.action,
        resource: input.resource,
        details: input.details || {},
      },
    });

    return log;
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - audit logging should not break the main flow
    return null;
  }
}

/**
 * Get audit logs with pagination and filters
 */
export async function getAuditLogs(params: {
  page?: number;
  limit?: number;
  action?: string;
  resource?: string;
  userId?: string;
}) {
  await requireAdmin();

  const { page = 1, limit = 20, action, resource, userId } = params;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (action) where.action = action;
  if (resource) where.resource = resource;
  if (userId) where.userId = userId;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
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
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs,
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
