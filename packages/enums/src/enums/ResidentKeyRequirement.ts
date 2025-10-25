import z from 'zod';

import type { ValueOfEnum } from '../types';

/**
 * @see https://w3c.github.io/webauthn/#enum-residentKeyRequirement
 */
export const ResidentKeyRequirement = {
  REQUIRED: 'required',
  PREFERRED: 'preferred',
  DISCOURAGED: 'discouraged',
} as const;

export type ResidentKeyRequirement = ValueOfEnum<typeof ResidentKeyRequirement>;

export const ResidentKeyRequirementSchema = z
  .enum(ResidentKeyRequirement)
  .meta({
    description: 'Resident key requirement',
    examples: [ResidentKeyRequirement.REQUIRED],
  });
