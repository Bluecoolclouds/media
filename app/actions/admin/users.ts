'use server';

import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createUserSchema, updateUserSchema } from '@/lib/validations/user.schema';
import type { CreateUserInput, UpdateUserInput } from '@/lib/validations/user.schema';
import { hashPassword } from '@/lib/auth';
import { createAuditLog } from './logs';
import { revalidatePath } from 'next/cache';

/**
 * Get all users with pagination and search
 */
export async function getUsers(params: {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'USER' | 'ADMIN';
}) {
  const user = await requireAdmin();

  const { page = 1, limit = 10, search, role } = params;
  const skip = (page - 1) * limit;

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
      take: limit,
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

  return {
    users,
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
 * Get a single user by ID
 */
export async function getUser(id: string) {
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
    throw new Error('User not found');
  }

  return user;
}

/**
 * Update user role
 */
export async function updateUserRole(id: string, role: 'USER' | 'ADMIN') {
  const admin = await requireAdmin();

  // Prevent admin from demoting themselves
  if (admin.id === id && role !== 'ADMIN') {
    throw new Error('You cannot change your own role');
  }

  const user = await prisma.user.update({
    where: { id },
    data: { role },
  });

  await createAuditLog({
    userId: admin.id,
    action: 'USER_ROLE_UPDATED',
    resource: 'user',
    details: { targetUserId: id, newRole: role },
  });

  revalidatePath('/admin/users');
  revalidatePath(`/admin/users/${id}`);

  return user;
}

/**
 * Delete a user
 */
export async function deleteUser(id: string) {
  const admin = await requireAdmin();

  // Prevent admin from deleting themselves
  if (admin.id === id) {
    throw new Error('You cannot delete your own account');
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true },
  });

  if (!user) {
    throw new Error('User not found');
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

  revalidatePath('/admin/users');

  return { success: true, message: 'User deleted successfully' };
}
