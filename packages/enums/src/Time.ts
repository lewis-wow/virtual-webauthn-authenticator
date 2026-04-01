import type { ValueOfEnum } from '@repo/types';

export const Time = {
  MILLISECONDS: 1,
  SECONDS: 1_000,
  MINUTES: 60_000,
  HOURS: 3_600_000,
  DAYS: 86_400_000,
  WEEKS: 604_800_000,
} as const;

export type Time = ValueOfEnum<typeof Time>;
