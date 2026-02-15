import type { ValueOfEnum } from '@repo/types';

export const StateAction = {
  USER_PRESENCE: 'USER_PRESENCE',
  USER_VERIFICATION: 'USER_VERIFICATION',
  CREDENTIAL_SELECTION: 'CREDENTIAL_SELECTION',
} as const;

export type StateAction = ValueOfEnum<typeof StateAction>;
