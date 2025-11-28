import { SortKeys } from '@repo/pagination/enums';
import type { ValueOfEnum } from '@repo/types';

export const LogSortKeys = {
  ...SortKeys,
} as const;

export type LogSortKeys = ValueOfEnum<typeof LogSortKeys>;
