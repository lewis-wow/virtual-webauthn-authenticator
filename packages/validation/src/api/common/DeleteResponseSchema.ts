import z from 'zod';

export const DeleteResponseSchema = z
  .object({
    success: z.literal(true),
  })
  .meta({
    id: 'DeleteResponse',
    ref: 'DeleteResponse',
  });

export type DeleteResponse = z.infer<typeof DeleteResponseSchema>;
