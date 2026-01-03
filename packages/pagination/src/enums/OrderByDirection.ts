import type { ValueOfEnum } from '@repo/types';

export const OrderByDirection = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

export type OrderByDirection = ValueOfEnum<typeof OrderByDirection>;
