import z from 'zod';

import { ApplicablePublicKeyCredentialSchema } from '../../spec/ApplicablePublicKeyCredentialSchema';
import { AuthenticatorContextArgsSchema } from '../AuthenticatorContextArgsSchema';
import { AuthenticatorGetAssertionArgsSchema } from '../AuthenticatorGetAssertionArgsSchema';
import { AuthenticatorMetaArgsSchema } from '../AuthenticatorMetaArgsSchema';

export const VirtualAuthenticatorCredentialSelectStateSchema = z.object({
  credentialOptions: z.array(ApplicablePublicKeyCredentialSchema),
  authenticatorGetAssertionArgs: AuthenticatorGetAssertionArgsSchema,
  meta: AuthenticatorMetaArgsSchema,
  context: AuthenticatorContextArgsSchema,
});

export type VirtualAuthenticatorCredentialSelectState = z.infer<
  typeof VirtualAuthenticatorCredentialSelectStateSchema
>;
