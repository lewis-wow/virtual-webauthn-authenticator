import z from 'zod';

export const ExceptionShapeSchema = z.object({
  code: z.string(),

  message: z.string().optional(),
  status: z.number().optional(),
  data: z.unknown().optional(),

  cause: z.unknown().optional(),
});

export type ExceptionShape = z.infer<typeof ExceptionShapeSchema>;
