import z from 'zod';

export const ExceptionShapeSchema: z.ZodType<AnyExceptionShape> = z.object({
  code: z.string(),

  message: z.string().optional(),
  status: z.number().optional(),
  data: z.unknown().or(z.undefined()),

  cause: z.unknown().optional(),
});

export type ExceptionShape<TCode extends string, TData = undefined> = {
  code: TCode;
  message?: string;
  status?: number;
  data: TData;
  cause?: unknown;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyExceptionShape = ExceptionShape<string, any>;
