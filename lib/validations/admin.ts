import { z } from 'zod';

// Model validations
export const createModelSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  endpoint: z.string().min(1, 'Endpoint is required'),
  type: z.enum(['TEXT_TO_IMAGE', 'IMAGE_TO_IMAGE', 'TEXT_TO_VIDEO', 'IMAGE_TO_VIDEO', 'AUDIO', 'LIPSYNC']),
  category: z.string().min(1, 'Category is required').max(100),
  provider: z.string().min(1, 'Provider is required').max(100),
  parameters: z.any().optional().default({}),
  isActive: z.boolean().default(true),
});

export const updateModelSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  endpoint: z.string().min(1).optional(),
  type: z.enum(['TEXT_TO_IMAGE', 'IMAGE_TO_IMAGE', 'TEXT_TO_VIDEO', 'IMAGE_TO_VIDEO', 'AUDIO', 'LIPSYNC']).optional(),
  category: z.string().min(1).max(100).optional(),
  provider: z.string().min(1).max(100).optional(),
  parameters: z.any().optional(),
  isActive: z.boolean().optional(),
});

// User validations
export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required').max(100),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['USER', 'ADMIN']).default('USER'),
  image: z.string().url().optional(),
});

export const updateUserSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(1).max(100).optional(),
  password: z.string().min(8).optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
  image: z.string().url().optional(),
});

// Pagination
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

// Generation filters
export const generationFiltersSchema = paginationSchema.extend({
  userId: z.string().optional(),
  modelId: z.string().optional(),
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export type CreateModelInput = z.infer<typeof createModelSchema>;
export type UpdateModelInput = z.infer<typeof updateModelSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type GenerationFiltersInput = z.infer<typeof generationFiltersSchema>;
