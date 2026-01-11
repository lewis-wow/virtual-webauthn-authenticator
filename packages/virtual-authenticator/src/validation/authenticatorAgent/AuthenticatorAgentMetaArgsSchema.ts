import { OriginSchema } from '@repo/core/zod-validation';
import z from 'zod';

import { AuthenticatorMetaArgsSchema } from '../authenticator/AuthenticatorMetaArgsSchema';

export const AuthenticatorAgentMetaArgsSchema =
  AuthenticatorMetaArgsSchema.safeExtend({
    origin: OriginSchema,
    allowWeakChallenges: z.boolean().optional(),
    crossOrigin: z.boolean().optional(),
    // topOrigin is set only if crossOrigin is true
    // @see https://www.w3.org/TR/webauthn-3/#dom-collectedclientdata-toporigin
    topOrigin: z.string().optional(),
  }).refine(
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

export type AuthenticatorAgentMetaArgs = z.infer<
  typeof AuthenticatorAgentMetaArgsSchema
>;
