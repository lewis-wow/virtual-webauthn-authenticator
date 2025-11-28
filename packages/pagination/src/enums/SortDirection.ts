import type { ValueOfEnum } from '@repo/types';

export const SortDirection = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

export type SortDirection = ValueOfEnum<typeof SortDirection>;
