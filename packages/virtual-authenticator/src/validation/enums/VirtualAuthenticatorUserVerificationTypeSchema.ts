import z from 'zod';

import { VirtualAuthenticatorUserVerificationType } from '../../enums/VirtualAuthenticatorUserVerificationType';

export const VirtualAuthenticatorUserVerificationTypeSchema = z.enum(
  VirtualAuthenticatorUserVerificationType,
);
