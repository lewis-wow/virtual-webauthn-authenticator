import {
  ResidentKeyRequirement,
  UserVerificationRequirement,
} from '@repo/enums';
import type { IAuthenticatorSelectionCriteria } from '@repo/types';
import z from 'zod';

import { AuthenticatorAttachmentSchema } from '../enums.js';

// Specifies requirements for the authenticator
export const AuthenticatorSelectionCriteriaSchema = z.object({
  authenticatorAttachment: AuthenticatorAttachmentSchema.optional(),
  requireResidentKey: z.boolean().optional(),
  residentKey: z.enum(ResidentKeyRequirement).optional(),
  userVerification: z.enum(UserVerificationRequirement).optional(),
}) satisfies z.ZodType<IAuthenticatorSelectionCriteria>;
