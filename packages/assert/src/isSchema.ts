import z from 'zod';

/**
 * Checks if the given data matches the provided Zod schema.
 * Returns true if validation succeeds, false otherwise.
 * Using this in a conditional narrows the type of 'data' for TypeScript.
 */
export function isSchema<T extends z.ZodTypeAny>(
  data: unknown,
  schema: T,
): data is z.infer<T> {
  const result = schema.safeParse(data);
  return result.success;
}
