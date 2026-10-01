import { z } from 'zod';

export const userRoleSchema = z.enum(['USER', 'ADMIN']);

export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long').optional(),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: userRoleSchema.optional().default('USER'),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  email: z.string().email().optional(),
  role: userRoleSchema.optional(),
  image: z.string().url().optional().or(z.literal('')),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
