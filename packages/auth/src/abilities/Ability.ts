import { defineAbility } from '@casl/ability';
import { assert, isNumber, isString } from 'typanion';

import { TokenType } from '../enums';
import { Permission } from '../enums/Permission';
import { PermissionEntity } from '../enums/PermissionEntity';
import type { JwtPayload } from '../validation/JwtPayloadSchema';

export class Ability {
  static forJwt(jwtPayload: JwtPayload) {
    if (jwtPayload.tokenType === TokenType.USER) {
      return Ability.forUser({ userId: jwtPayload.userId });
    }

    return Ability.forApiKey({
      apiKeyId: jwtPayload.apiKeyId,
      createdWebAuthnCredentialCount: jwtPayload.createdWebAuthnCredentialCount,
      permissions: jwtPayload.permissions,
    });
  }

  static forUser(opts: { userId: string }) {
    const { userId } = opts;
    assert(userId, isString());

    return defineAbility((can) => {
      can('create', PermissionEntity.Credential);
      can('get', PermissionEntity.Credential, { userId });

      can('create', PermissionEntity.WebAuthnCredential);
      can('read', PermissionEntity.WebAuthnCredential, { userId });
      can('delete', PermissionEntity.WebAuthnCredential, { userId });

      can('create', PermissionEntity.ApiKey);
      can('read', PermissionEntity.ApiKey, { userId });
      can('update', PermissionEntity.ApiKey, { userId });
      can('revoke', PermissionEntity.ApiKey, { userId });
      can('delete', PermissionEntity.ApiKey, { userId });
    });
  }

  static forApiKey(opts: {
    apiKeyId: string;
    permissions: Permission[];
    createdWebAuthnCredentialCount: number;
  }) {
    const { apiKeyId, permissions, createdWebAuthnCredentialCount } = opts;

    assert(apiKeyId, isString());
    assert(createdWebAuthnCredentialCount, isNumber());

    return defineAbility((can) => {
      if (
        permissions.includes(Permission['Credential.create']) &&
        createdWebAuthnCredentialCount === 0
      ) {
        can('create', PermissionEntity.Credential);
      }

      if (permissions.includes(Permission['Credential.get'])) {
        can('get', PermissionEntity.Credential, {
          apiKeyId,
        });
      }
    });
  }
}
