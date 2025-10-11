import type { ValueOfEnum } from '../types.js';

/**
 * @see https://w3c.github.io/webauthn/#enum-userVerificationRequirement
 */
export const UserVerificationRequirement = {
  REQUIRED: 'required',
  PREFERRED: 'preferred',
  DISCOURAGED: 'discouraged',
} as const;

export type UserVerificationRequirement = ValueOfEnum<
  typeof UserVerificationRequirement
>;
