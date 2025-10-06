import type { PropertyKey } from '@repo/types';
import type { UnionToTuple } from 'type-fest';

export const keyOf = <T extends Record<PropertyKey, PropertyKey>>(
  obj: T,
): UnionToTuple<keyof T> => Object.keys(obj) as UnionToTuple<keyof T>;
