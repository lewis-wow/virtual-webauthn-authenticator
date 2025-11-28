import type { ValueOfEnum } from '@repo/types';

export const LogAction = {
  CREATE: 'CREATE',
  GET: 'GET',
  LIST: 'LIST',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
} as const;

export type LogAction = ValueOfEnum<typeof LogAction>;
