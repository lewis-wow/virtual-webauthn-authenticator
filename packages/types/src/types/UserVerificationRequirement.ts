/**
 * Represents the requirements for user verification.
 * - `required`: User verification is required.
 * - `preferred`: User verification is preferred, but not required.
 * - `discouraged`: User verification is discouraged.
 */
export type UserVerificationRequirement =
  | 'required'
  | 'preferred'
  | 'discouraged';
