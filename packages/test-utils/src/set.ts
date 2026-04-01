import type { Primitive } from 'type-fest';

type UpdateFn<T> = (prev: T) => T;

/**
 * Type definition for DeepSet.
 * Handles primitives, arrays (treated as atomic), and nested objects.
 */
type DeepSet<T> = T extends Primitive
  ? T | UpdateFn<T>
  : // eslint-disable-next-line @typescript-eslint/no-explicit-any
    T extends Array<any>
    ? T | UpdateFn<T> // Treat arrays as whole units or update via function
    : {
        [K in keyof T]?: DeepSet<T[K]> | UpdateFn<T[K]> | T[K];
      };

/**
 * Immutable deep update function.
 * @param target The original object (will not be modified).
 * @param payload The update specification (values, nested objects, or updater functions).
 * @returns A new deep copy of the object with updates applied.
 */
export function set<T>(target: T, payload: DeepSet<T>): T {
  // Case 1: Payload is a function -> Call it with current target
  if (typeof payload === 'function') {
    return (payload as unknown as UpdateFn<T>)(target);
  }

  // Case 2: Payload is Array, Primitive, or Null -> Overwrite directly
  // We explicitly check Array.isArray(payload) to ensure we replace arrays
  // rather than attempting to merge them recursively.
  if (
    typeof payload !== 'object' ||
    payload === null ||
    Array.isArray(payload) ||
    typeof target !== 'object' ||
    target === null
  ) {
    return payload as unknown as T;
  }

  // Case 3: Recursion for Objects
  // Create a shallow copy of the current level to ensure immutability
  const clone = Array.isArray(target) ? [...target] : { ...target };

  // Iterate over keys in the payload (the update spec)
  for (const key in payload) {
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      // Recursively call set for each property
      clone[key as keyof typeof clone] = set(
        target[key as keyof typeof target],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload as any)[key],
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return clone as any;
}
