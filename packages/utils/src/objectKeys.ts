import type { PropertyKey } from '@repo/types';

export const objectKeys = <T extends Record<PropertyKey, PropertyKey>>(
  obj: T,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): keyof T[] => Object.keys(obj) as any;
