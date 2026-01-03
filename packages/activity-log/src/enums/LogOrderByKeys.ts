import { SortKeys } from '@repo/pagination/enums';
import type { ValueOfEnum } from '@repo/types';

export const LogOrderByKeys = {
  ...SortKeys,
} as const;

export type LogOrderByKeys = ValueOfEnum<typeof LogOrderByKeys>;
