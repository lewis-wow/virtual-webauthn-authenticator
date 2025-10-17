import type { IAuthenticationExtensionsClientInputs } from '@repo/types';
import z from 'zod';

export const AuthenticationExtensionsClientInputsSchema = z
  .record(z.string(), z.unknown())
  .meta({
    type: 'object',
    description:
      'The client extensions passed to the authenticator. For more information, see https://www.w3.org/TR/webauthn/#dictdef-authenticationextensionsclientinputs.',
    examples: [{ credProps: true }],
  }) satisfies z.ZodType<IAuthenticationExtensionsClientInputs>;
