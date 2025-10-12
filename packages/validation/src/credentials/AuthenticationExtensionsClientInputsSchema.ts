import type { IAuthenticationExtensionsClientInputs } from '@repo/types';
import z from 'zod';

export const AuthenticationExtensionsClientInputsSchema = z.record(z.unknown()) satisfies z.ZodType<IAuthenticationExtensionsClientInputs>;
