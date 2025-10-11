import z from 'zod';
import { ResidentKeyRequirement } from '@repo/enums';

/**
 * Corresponds to: `ResidentKeyRequirement`
 */
export const ResidentKeyRequirementSchema = z
  .enum(ResidentKeyRequirement)
  .describe('The resident key requirement.');
