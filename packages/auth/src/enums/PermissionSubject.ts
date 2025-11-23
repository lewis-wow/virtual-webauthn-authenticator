import type { ValueOfEnum } from '@repo/types';

export const PermissionSubject = {
  API_KEY: 'API_KEY',
  USER: 'USER',
} as const;

export type PermissionSubject = ValueOfEnum<typeof PermissionSubject>;
