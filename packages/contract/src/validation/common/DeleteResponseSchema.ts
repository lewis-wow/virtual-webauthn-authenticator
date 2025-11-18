import z from 'zod';

export const DeleteResponseSchema = z
  .object({
    success: z.literal(true),
  })
  .meta({
    ref: 'DeleteResponse',
  });
