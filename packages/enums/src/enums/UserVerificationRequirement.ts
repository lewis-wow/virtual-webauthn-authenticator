import z from 'zod';

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

export const UserVerificationRequirementSchema = z
  .enum(UserVerificationRequirement)
  .meta({
    description: 'User verification requirement',
    examples: [UserVerificationRequirement.REQUIRED],
  });
