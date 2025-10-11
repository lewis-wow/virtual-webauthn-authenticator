import z from 'zod';
import { UserVerificationRequirement } from '@repo/enums';

/**
 * Corresponds to: `UserVerificationRequirement`
 */
export const UserVerificationRequirementSchema = z
  .enum(UserVerificationRequirement)
  .describe('The user verification requirement.');
