import type { ValueOfEnum } from '@repo/types';

export const AuthType = {
  SESSION: 'SESSION',
  API_KEY: 'API_KEY',
} as const;

export type AuthType = ValueOfEnum<typeof AuthType>;
