import z from 'zod';

/**
 * Higher-order function that creates a type guard for a specific Zod schema.
 * * Usage:
 * const isUser = createGuard(UserSchema);
 * if (isUser(data)) { ... }
 */
export function guardSchema<T extends z.ZodTypeAny>(schema: T) {
  return (data: unknown): data is z.infer<T> => {
    return schema.safeParse(data).success;
  };
}
