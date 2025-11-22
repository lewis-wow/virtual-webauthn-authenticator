import type { ValueOfEnum } from '@repo/types';
import { Schema } from 'effect';

export const TokenBindingStatus = {
  PRESENT: 'present',
  SUPPORTED: 'supported',
} as const;

export type TokenBindingStatus = ValueOfEnum<typeof TokenBindingStatus>;

export const TokenBindingStatusSchema = Schema.Enums(TokenBindingStatus).pipe(
  Schema.annotations({
    identifier: 'TokenBindingStatus',
    examples: [TokenBindingStatus.PRESENT],
  }),
);
