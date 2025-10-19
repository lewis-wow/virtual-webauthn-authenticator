import type { KeyPrefix } from '@repo/types';
import type { Simplify } from 'type-fest';

export const keyPrefix = <P extends string, T extends Record<string, unknown>>(
  prefix: P,
  obj: T,
): Simplify<KeyPrefix<P, T>> => {
  return Object.keys(obj).reduce<Record<string, unknown>>((acc, key) => {
    acc[`${prefix}${key}`] = obj[key];

    return acc;
  }, {}) as Simplify<KeyPrefix<P, T>>;
};
