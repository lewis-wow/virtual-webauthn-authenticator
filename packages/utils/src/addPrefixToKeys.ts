import type { AddPrefix } from '@repo/types';
import type { Simplify } from 'type-fest';

export const addPrefixToKeys = <
  T extends Record<string, unknown>,
  P extends string,
>(
  obj: T,
  prefix: P,
): Simplify<AddPrefix<T, P>> => {
  // Use Object.entries to get [key, value] pairs
  const entries = Object.entries(obj);

  // Map over the entries to create new [prefixedKey, value] pairs
  const prefixedEntries = entries.map(([key, value]) => {
    return [`${prefix}${key}`, value];
  });

  // Convert the new entries back into an object
  const result = Object.fromEntries(prefixedEntries);

  // We must use a type assertion here.
  // TypeScript knows `result` is an object with string keys,
  // but it cannot infer our specific, complex mapped type `AddPrefix<T, P>`
  // from the dynamic runtime logic of `Object.fromEntries`.
  return result as AddPrefix<T, P>;
};
