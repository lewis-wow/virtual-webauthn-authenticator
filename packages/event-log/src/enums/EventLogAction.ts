import type { ValueOfEnum } from '@repo/types';

export const EventLogAction = {
  CREATE: 'CREATE',
  GET: 'GET',
  LIST: 'LIST',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
} as const;

export type EventLogAction = ValueOfEnum<typeof EventLogAction>;
