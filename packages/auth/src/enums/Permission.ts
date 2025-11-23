import type { ValueOfEnum } from '@repo/types';

export const Permission = {
  'credential.create': 'credential.create',
  'credential.get': 'credential.get',
  'credential.create_once': 'credential.create_once',
  'credential.get_created': 'credential.get_created',
} as const;

export type Permission = ValueOfEnum<typeof Permission>;
