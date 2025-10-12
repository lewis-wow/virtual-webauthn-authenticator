import type { IAuthenticationExtensionsClientInputs } from '@repo/types';
import z from 'zod';

export const AuthenticationExtensionsClientInputsSchema = z.record(
  z.string(),
  z.unknown(),
) satisfies z.ZodType<IAuthenticationExtensionsClientInputs>;
