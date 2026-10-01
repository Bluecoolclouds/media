'use server';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';
import { createUserSchema, updateUserSchema } from '@/lib/validations/admin';
import bcrypt from 'bcryptjs';

export async function createUser(data: unknown) {
  const { error: authError } = await requireAdmin();
  if (authError) {
    throw new Error('Unauthorized');
  }

  const validation = createUserSchema.safeParse(data);
  if (!validation.success) {
    throw new Error('Invalid input: ' + validation.error.issues[0].message);
  }

  const validated = validation.data;

  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: validated.email },
  });

  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(validated.password, 10);

  const user = await prisma.user.create({
    data: {
      email: validated.email,
      name: validated.name,
      password: hashedPassword,
      role: validated.role,
      image: validated.image,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  revalidatePath('/admin/users');
  return user;
}

export async function updateUser(id: string, data: unknown) {
  const { error: authError } = await requireAdmin();
  if (authError) {
    throw new Error('Unauthorized');
  }

  const validation = updateUserSchema.safeParse(data);
  if (!validation.success) {
    throw new Error('Invalid input: ' + validation.error.issues[0].message);
  }

  const validated = validation.data;

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new Error('User not found');
  }

  // If email is being updated, check for conflicts
  if (validated.email && validated.email !== existingUser.email) {
    const emailConflict = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (emailConflict) {
      throw new Error('User with this email already exists');
    }
  }

  // Hash password if provided
  let hashedPassword: string | undefined;
  if (validated.password) {
    hashedPassword = await bcrypt.hash(validated.password, 10);
  }

  const updateData: any = {};
  if (validated.email) updateData.email = validated.email;
  if (validated.name) updateData.name = validated.name;
  if (hashedPassword) updateData.password = hashedPassword;
  if (validated.role) updateData.role = validated.role;
  if (validated.image !== undefined) updateData.image = validated.image;

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  revalidatePath('/admin/users');
  revalidatePath(`/admin/users/${id}`);
  return user;
}

export async function deleteUser(id: string, currentUserId: string) {
  const { error: authError } = await requireAdmin();
  if (authError) {
    throw new Error('Unauthorized');
  }

  // Prevent admin from deleting themselves
  if (id === currentUserId) {
    throw new Error('Cannot delete your own account');
  }

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new Error('User not found');
  }

  // Delete user (cascade will handle generations)
  await prisma.user.delete({
    where: { id },
  });

  revalidatePath('/admin/users');
  return { success: true };
}

export async function updateUserRole(id: string, role: 'USER' | 'ADMIN') {
  const { error: authError } = await requireAdmin();
  if (authError) {
    throw new Error('Unauthorized');
  }

  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new Error('User not found');
  }

  const user = await prisma.user.update({
    where: { id },
    data: { role },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  revalidatePath('/admin/users');
  revalidatePath(`/admin/users/${id}`);
  return user;
}

export async function getUserById(id: string) {
  const { error: authError } = await requireAdmin();
  if (authError) {
    throw new Error('Unauthorized');
  }

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
        select: { generations: true },
      },
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
}

export async function getUsers(params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}) {
  const { error: authError } = await requireAdmin();
  if (authError) {
    throw new Error('Unauthorized');
  }

  const page = params?.page || 1;
  const limit = params?.limit || 10;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (params?.search) {
    where.OR = [
      { email: { contains: params.search, mode: 'insensitive' } },
      { name: { contains: params.search, mode: 'insensitive' } },
    ];
  }

  if (params?.role) {
    where.role = params.role;
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
          select: { generations: true },
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
    },
  };
}
