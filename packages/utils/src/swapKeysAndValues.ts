import type { SwapKeysAndValues } from '@repo/types';
/**
 * Swaps the keys and values of a constant object.
 *
 * @param obj The object to swap. The object's values must be valid key types.
 * @returns A new object with the keys and values swapped.
 */
export const swapKeysAndValues = <
  const T extends Record<PropertyKey, PropertyKey>,
>(
  obj: T,
): SwapKeysAndValues<T> => {
  const swapped = Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [value, key]),
  );

  return swapped as SwapKeysAndValues<T>;
};
