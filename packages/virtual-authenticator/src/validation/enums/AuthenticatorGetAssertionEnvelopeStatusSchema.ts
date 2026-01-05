import z from 'zod';

import { AuthenticatorGetAssertionEnvelopeStatus } from '../../enums/AuthenticatorGetAssertionEnvelopeStatus';

export const AuthenticatorGetAssertionEnvelopeStatusSchema = z.enum(
  AuthenticatorGetAssertionEnvelopeStatus,
);
