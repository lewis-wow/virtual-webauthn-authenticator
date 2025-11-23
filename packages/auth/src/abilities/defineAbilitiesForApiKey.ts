import { defineAbility } from '@casl/ability';
import type { Apikey } from '@repo/prisma';

import { Permission } from '../enums/Permission';
import { PermissionEntity } from '../enums/PermissionEntity';

export const defineAbilitiesForApiKey = (
  apiKey: Pick<Apikey, 'id' | 'permissions'>,
) => {
  return defineAbility((can) => {
    if (apiKey.permissions.includes(Permission['Credential.create'])) {
      can('create', PermissionEntity.Credential);
    }

    if (apiKey.permissions.includes(Permission['Credential.get'])) {
      can('get', PermissionEntity.Credential, { apiKeyId: apiKey.id });
    }
  });
};
