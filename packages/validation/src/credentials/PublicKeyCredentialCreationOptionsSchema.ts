import { AttestationSchema } from '@repo/enums';
import type { IPublicKeyCredentialCreationOptions } from '@repo/types';
import z from 'zod';

import { Base64URLBufferSchema } from '../Base64URLBufferSchema.js';
import { AuthenticatorSelectionCriteriaSchema } from './AuthenticatorSelectionCriteriaSchema.js';
import { PublicKeyCredentialDescriptorSchema } from './PublicKeyCredentialDescriptorSchema.js';
import { PublicKeyCredentialParametersSchema } from './PublicKeyCredentialParametersSchema.js';
import { PublicKeyCredentialRpEntitySchema } from './PublicKeyCredentialRpEntitySchema.js';
import { PublicKeyCredentialUserEntitySchema } from './PublicKeyCredentialUserEntitySchema.js';

/**
 * Zod schema for WebAuthn's PublicKeyCredentialCreationOptions.
 * This is sent from the server to the client to initiate passkey registration.
 */
export const PublicKeyCredentialCreationOptionsSchema = z
  .object({
    rp: PublicKeyCredentialRpEntitySchema,
    user: PublicKeyCredentialUserEntitySchema,
    challenge: Base64URLBufferSchema,
    pubKeyCredParams: z.array(PublicKeyCredentialParametersSchema),
    timeout: z.number().optional(),
    excludeCredentials: z.array(PublicKeyCredentialDescriptorSchema).optional(),
    authenticatorSelection: AuthenticatorSelectionCriteriaSchema.optional(),
    attestation: AttestationSchema.optional(),
    // Extensions can be complex; a generic record is often sufficient for validation
    extensions: z.record(z.string(), z.unknown()).optional(),
  })
  .meta({
    id: 'PublicKeyCredentialCreationOptions',
    description: 'Options for creating a new public key credential.',
  }) satisfies z.ZodType<IPublicKeyCredentialCreationOptions>;
