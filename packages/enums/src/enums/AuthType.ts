import type { ValueOfEnum } from '@repo/types';
import z from 'zod';

export const AuthType = {
  SESSION: 'SESSION',
  API_KEY: 'API_KEY',
} as const;

export type AuthType = ValueOfEnum<typeof AuthType>;

export const AuthTypeSchema = z.enum(AuthType).meta({
  description: 'Auth type',
  examples: [AuthType.SESSION],
});
