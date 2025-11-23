import { upsertTestingUser } from '@repo/prisma/__tests__/helpers';

import { PrismaClient, User } from '@repo/prisma';
import { describe, expect, test, beforeEach, afterEach } from 'vitest';

import { ApiKeyManager } from '../../src/ApiKeyManager';
import {
  PermissionActor,
  PermissionManager,
} from '../../src/PermissionManager';
import { PermissionAction } from '../../src/enums/PermissionAction';
import { PermissionSubject } from '../../src/enums/PermissionSubject';
import { ApiKey } from '../../src/validation/ApiKeySchema';

const prisma = new PrismaClient();

const cleanup = async () => {
  await prisma.$transaction([
    prisma.user.deleteMany(),
    prisma.apikey.deleteMany(),
    prisma.permission.deleteMany(),
  ]);
};

const RESOURCE_TYPE = 'TEST-RESOURCE';
const RESOURCE_ID = 'f84468a3-f383-41ce-83e2-5aab4a712c17';

describe('PermissionManager', () => {
  describe.each([PermissionSubject.USER, PermissionSubject.API_KEY])(
    '%s',
    (permissionSubject) => {
      const permissionManager = new PermissionManager({
        prisma,
      });
      const apiKeyManager = new ApiKeyManager({
        prisma,
      });
      let user: User;
      let apiKey: ApiKey;
      let actor: PermissionActor;

      beforeEach(async () => {
        user = await upsertTestingUser({ prisma });

        ({ apiKey } = await apiKeyManager.generate({
          userId: user.id,
        }));

        actor = {
          subjectId:
            permissionSubject === PermissionSubject.USER ? user.id : apiKey.id,
          permissionSubject,
        };
      });

      afterEach(async () => {
        await cleanup();
      });

      describe('grantPermission()', () => {
        test('Grant permission for specific resource ID', async () => {
          const request = {
            action: PermissionAction.CREATE,
            resourceType: RESOURCE_TYPE,
            resourceId: RESOURCE_ID,
          };

          await permissionManager.grantPermission({
            actor,
            request,
          });

          const hasPermission = await permissionManager.hasPermission({
            actor,
            request,
          });

          expect(hasPermission).toBe(true);
        });

        test('Grant permission for all resources', async () => {
          const request = {
            action: PermissionAction.CREATE,
            resourceType: RESOURCE_TYPE,
            resourceId: null,
          };

          await permissionManager.grantPermission({
            actor,
            request,
          });

          const hasPermission = await permissionManager.hasPermission({
            actor,
            request: {
              ...request,
              resourceId: 'SOME-RESOURCE-ID',
            },
          });

          expect(hasPermission).toBe(true);
        });

        test('Granting the same permission twice does not create duplicates (Idempotency)', async () => {
          const request = {
            action: PermissionAction.READ,
            resourceType: RESOURCE_TYPE,
            resourceId: RESOURCE_ID,
          };

          // First Grant
          await permissionManager.grantPermission({
            actor,
            request,
          });

          // Second Grant (Same data)
          await permissionManager.grantPermission({
            actor,
            request,
          });

          const whereClause = {
            action: PermissionAction.READ,
            resourceType: RESOURCE_TYPE,
            resourceId: RESOURCE_ID,
            ...(permissionSubject === PermissionSubject.USER
              ? { userId: actor.subjectId }
              : { apiKeyId: actor.subjectId }),
          };

          // Verify database has only 1 record
          const count = await prisma.permission.count({
            where: whereClause,
          });

          expect(count).toBe(1);
        });
      });

      describe('revokePermission()', () => {
        test('Revoke successfully removes a specific permission', async () => {
          const request = {
            action: PermissionAction.DELETE,
            resourceType: RESOURCE_TYPE,
            resourceId: RESOURCE_ID,
          };

          // Setup: Grant first
          await permissionManager.grantPermission({
            actor,
            request,
          });

          // Verify it exists
          let hasPermission = await permissionManager.hasPermission({
            actor,
            request,
          });
          expect(hasPermission).toBe(true);

          // Act: Revoke
          await permissionManager.revokePermission({ actor, request });

          // Verify it is gone
          hasPermission = await permissionManager.hasPermission({
            actor,
            request,
          });
          expect(hasPermission).toBe(false);
        });

        test('Revoking a wildcard permission removes access to specific resources', async () => {
          const wildcardRequest = {
            action: PermissionAction.WRITE,
            resourceType: RESOURCE_TYPE,
            resourceId: null,
          };

          // Grant Global/Wildcard access
          await permissionManager.grantPermission({
            actor,
            request: wildcardRequest,
          });

          // Check specific access (should be true via wildcard)
          const specificCheck = {
            ...wildcardRequest,
            resourceId: 'SOME-SPECIFIC-ID',
          };
          expect(
            await permissionManager.hasPermission({
              actor,
              request: specificCheck,
            }),
          ).toBe(true);

          // Revoke Global access
          await permissionManager.revokePermission({
            actor,
            request: wildcardRequest,
          });

          // Check specific access (should now be false)
          expect(
            await permissionManager.hasPermission({
              actor,
              request: specificCheck,
            }),
          ).toBe(false);
        });
      });

      describe('hasPermission()', () => {
        test('Returns false if Actor has permission for resource but different Action', async () => {
          // Grant READ
          await permissionManager.grantPermission({
            actor,
            request: {
              action: PermissionAction.READ,
              resourceType: RESOURCE_TYPE,
              resourceId: RESOURCE_ID,
            },
          });

          // Check WRITE
          const hasPermission = await permissionManager.hasPermission({
            actor,
            request: {
              action: PermissionAction.WRITE, // Different action
              resourceType: RESOURCE_TYPE,
              resourceId: RESOURCE_ID,
            },
          });

          expect(hasPermission).toBe(false);
        });

        test('Returns false if Actor has permission for Action but different Resource ID', async () => {
          // Grant for ID-1
          await permissionManager.grantPermission({
            actor,
            request: {
              action: PermissionAction.READ,
              resourceType: RESOURCE_TYPE,
              resourceId: 'ID-1',
            },
          });

          // Check for ID-2
          const hasPermission = await permissionManager.hasPermission({
            actor,
            request: {
              action: PermissionAction.READ,
              resourceType: RESOURCE_TYPE,
              resourceId: 'ID-2', // Different ID
            },
          });

          expect(hasPermission).toBe(false);
        });
      });

      describe('listPermissions()', () => {
        test('Lists all permissions associated with the actor', async () => {
          // Grant two distinct permissions
          await permissionManager.grantPermission({
            actor,
            request: {
              action: PermissionAction.READ,
              resourceType: 'A',
              resourceId: null,
            },
          });

          await permissionManager.grantPermission({
            actor,
            request: {
              action: PermissionAction.WRITE,
              resourceType: 'B',
              resourceId: '123',
            },
          });

          const list = await permissionManager.listPermissions({
            actor,
          });

          expect(list).toHaveLength(2);
          expect(list).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                resourceType: 'A',
                action: PermissionAction.READ,
              }),
              expect.objectContaining({
                resourceType: 'B',
                action: PermissionAction.WRITE,
              }),
            ]),
          );
        });

        test('Returns empty array if actor has no permissions', async () => {
          const list = await permissionManager.listPermissions({ actor });
          expect(list).toEqual([]);
        });
      });
    },
  );
});
