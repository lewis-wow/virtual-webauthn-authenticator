import z from 'zod';

export const ExceptionShapeSchema = z.object({
  name: z.string(),

  message: z.string().optional(),
  code: z.string().optional(),
  status: z.number().optional(),
  cause: z.unknown().optional(),
});

export type ExceptionShape = z.infer<typeof ExceptionShapeSchema>;
