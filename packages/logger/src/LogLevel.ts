import type { ValueOfEnum } from '@repo/types';

export const LogLevel = {
  error: 0,
  warn: 1,
  info: 3,
  debug: 4,
  trace: 5,
  silent: -999,
  verbose: 999,
} as const;

export type LogLevel = ValueOfEnum<typeof LogLevel>;
