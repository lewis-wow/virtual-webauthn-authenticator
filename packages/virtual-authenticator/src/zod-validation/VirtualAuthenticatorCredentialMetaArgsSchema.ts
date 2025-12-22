import { OriginSchema } from '@repo/core/zod-validation';
import z from 'zod';

export const VirtualAuthenticatorCredentialMetaArgsSchema = z
  .object({
    origin: OriginSchema,
    userId: z.string(),

    allowWeakChallenges: z.boolean().optional(),
    userVerificationEnabled: z.boolean().optional(),
    userPresenceEnabled: z.boolean().optional(),

    crossOrigin: z.boolean().optional(),
    // topOrigin is set only if crossOrigin is true
    // @see https://www.w3.org/TR/webauthn-3/#dom-collectedclientdata-toporigin
    topOrigin: z.string().optional(),
  })
  .refine(
    (data) => {
      // If crossOrigin is true, topOrigin must be present
      if (data.crossOrigin === true) {
        return data.topOrigin !== undefined;
      }
      // If crossOrigin is false or undefined, topOrigin should be undefined
      return data.topOrigin === undefined;
    },
    {
      message: 'topOrigin must be set if and only if crossOrigin is true',
      path: ['topOrigin'],
    },
  );

export type VirtualAuthenticatorCredentialMetaArgs = z.infer<
  typeof VirtualAuthenticatorCredentialMetaArgsSchema
>;
