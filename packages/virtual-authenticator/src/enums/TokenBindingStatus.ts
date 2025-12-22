import type { ValueOfEnum } from '@repo/types';
import { Schema } from 'effect';

/**
 * Token binding status indicating whether token binding was negotiated and used.
 * @see https://www.w3.org/TR/webauthn-3/#dom-tokenbindingstatus
 */
export const TokenBindingStatus = {
  /**
   * Indicates token binding was used when communicating with the Relying Party.
   * In this case, the id member MUST be present.
   */
  PRESENT: 'present',
  /**
   * Indicates the client supports token binding, but it was not negotiated
   * when communicating with the Relying Party.
   */
  SUPPORTED: 'supported',
} as const;

export type TokenBindingStatus = ValueOfEnum<typeof TokenBindingStatus>;

export const TokenBindingStatusSchema = Schema.Enums(TokenBindingStatus).pipe(
  Schema.annotations({
    identifier: 'TokenBindingStatus',
    title: 'TokenBindingStatus',
    examples: [TokenBindingStatus.PRESENT],
  }),
);
