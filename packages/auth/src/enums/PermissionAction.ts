import type { ValueOfEnum } from '@repo/types';

export const PermissionAction = {
  CREATE: 'CREATE',
  WRITE: 'WRITE',
  READ: 'READ',
  DELETE: 'DELETE',
} as const;

export type PermissionAction = ValueOfEnum<typeof PermissionAction>;
