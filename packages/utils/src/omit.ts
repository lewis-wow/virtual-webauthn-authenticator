import type { Simplify } from 'type-fest';

/**
 * Returns a copy of the object with the specified keys removed.
 *
 * @param obj The source object.
 * @param keys The keys to omit from the object.
 * @returns A new object without the specified keys.
 */
export const omit = <T extends object, K extends keyof T>(
  obj: T,
  ...keys: (K | (string & {}))[]
): Simplify<Omit<T, K>> => {
  const result = { ...obj }; // Create a shallow copy to avoid mutation

  for (const key of keys) {
    if (Object.hasOwn(result, key)) {
      delete result[key as keyof T];
    }
  }

  return result;
};
