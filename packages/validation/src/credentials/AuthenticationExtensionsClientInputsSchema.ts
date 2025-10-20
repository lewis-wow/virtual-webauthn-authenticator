import type { IAuthenticationExtensionsClientInputs } from '@repo/types';
import z from 'zod';

import { see } from '../meta/see';

/**
 * @see https://www.w3.org/TR/webauthn/#dictdef-authenticationextensionsclientinputs
 */
export const AuthenticationExtensionsClientInputsSchema = z
  .record(z.string(), z.unknown())
  .meta({
    id: 'AuthenticationExtensionsClientInputs',
    description: `The client extensions passed to the authenticator. ${see('https://www.w3.org/TR/webauthn/#dictdef-authenticationextensionsclientinputs')}`,
    examples: [{ credProps: true }],
  }) satisfies z.ZodType<IAuthenticationExtensionsClientInputs>;
