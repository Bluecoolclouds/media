import { z } from 'zod';

export const modelTypeSchema = z.enum([
  'TEXT_TO_IMAGE',
  'IMAGE_TO_IMAGE',
  'TEXT_TO_VIDEO',
  'IMAGE_TO_VIDEO',
  'AUDIO',
  'LIPSYNC',
  'AVATAR',
  'RECAST',
  'PRODUCT_CARD',
]);

export const createModelSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  endpoint: z.string().min(1, 'Endpoint is required').max(500, 'Endpoint too long'),
  type: modelTypeSchema,
  category: z.string().min(1, 'Category is required').max(100, 'Category too long'),
  provider: z.string().min(1, 'Provider is required').max(100, 'Provider too long'),
  parameters: z.any().optional().default({}),
  isActive: z.boolean().optional().default(true),
});

export const updateModelSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  endpoint: z.string().min(1).max(500).optional(),
  type: modelTypeSchema.optional(),
  category: z.string().min(1).max(100).optional(),
  provider: z.string().min(1).max(100).optional(),
  parameters: z.any().optional(),
  isActive: z.boolean().optional(),
});

export type CreateModelInput = z.infer<typeof createModelSchema>;
export type UpdateModelInput = z.infer<typeof updateModelSchema>;
