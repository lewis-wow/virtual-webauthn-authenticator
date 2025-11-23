import { defineAbility } from '@casl/ability';
import type { User } from '@repo/prisma';

import { PermissionEntity } from '../enums/PermissionEntity';

export const defineAbilitiesForUser = (user: Pick<User, 'id'>) => {
  return defineAbility((can) => {
    can('create', PermissionEntity.Credential);
    can('get', PermissionEntity.Credential, { userId: user.id });

    can('create', PermissionEntity.WebAuthnCredential);
    can('read', PermissionEntity.WebAuthnCredential, { userId: user.id });
    can('delete', PermissionEntity.WebAuthnCredential, { userId: user.id });

    can('create', PermissionEntity.ApiKey);
    can('read', PermissionEntity.ApiKey, { userId: user.id });
    can('update', PermissionEntity.ApiKey, { userId: user.id });
    can('revoke', PermissionEntity.ApiKey, { userId: user.id });
    can('delete', PermissionEntity.ApiKey, { userId: user.id });
  });
};
