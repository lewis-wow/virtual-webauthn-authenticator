import { ValueOf } from '../types.js';

/**
 * @see https://w3c.github.io/webauthn/#enum-residentKeyRequirement
 */
export const ResidentKeyRequirement = {
  REQUIRED: 'required',
  PREFERRED: 'preferred',
  DISCOURAGED: 'discouraged',
} as const;

export type ResidentKeyRequirement = ValueOf<typeof ResidentKeyRequirement>;
