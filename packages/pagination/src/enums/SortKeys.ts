import type { ValueOfEnum } from '@repo/types';

export const SortKeys = {
  ID: 'id',
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
} as const;

export type SortKeys = ValueOfEnum<typeof SortKeys>;
