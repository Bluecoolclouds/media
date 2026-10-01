import { z } from 'zod';

export const generationStatusSchema = z.enum([
  'PENDING',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
]);

export const generationFilterSchema = z.object({
  status: generationStatusSchema.optional(),
  userId: z.string().optional(),
  modelId: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
});

export type GenerationFilterInput = z.infer<typeof generationFilterSchema>;
