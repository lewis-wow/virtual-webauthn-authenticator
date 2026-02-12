import type { ValueOfEnum } from '@repo/types';

export const StateType = {
  REGISTRATION: 'REGISTRATION',
  AUTHENTICATION: 'AUTHENTICATION',
} as const;

export type StateType = ValueOfEnum<typeof StateType>;
