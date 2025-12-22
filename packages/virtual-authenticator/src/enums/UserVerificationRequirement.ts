import type { ValueOfEnum } from '@repo/types';

/**
 * A WebAuthn Relying Party may require user verification for some of its operations
 * but not for others, and may use this type to express its needs.
 * @see https://www.w3.org/TR/webauthn-3/#enum-userVerificationRequirement
 */
export const UserVerificationRequirement = {
  /**
   * The Relying Party requires user verification for the operation and will fail
   * the operation if the response does not have the UV flag set.
   */
  REQUIRED: 'required',
  /**
   * The Relying Party prefers user verification for the operation if possible,
   * but will not fail the operation if the response does not have the UV flag set.
   */
  PREFERRED: 'preferred',
  /**
   * The Relying Party does not want user verification employed during the operation
   * (e.g., to minimize disruption to the user interaction flow).
   */
  DISCOURAGED: 'discouraged',
} as const;

export type UserVerificationRequirement = ValueOfEnum<
  typeof UserVerificationRequirement
>;
