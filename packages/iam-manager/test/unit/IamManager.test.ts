import { test, describe, expect, beforeEach } from 'vitest';
import {
  PrismaClient,
  PermissionAction,
  PermissionResource,
  RoleName,
} from '@repo/prisma';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { IamManager } from '../../src/IamManager.js';

const prisma = mockDeep<PrismaClient>();

describe('IamManager', () => {
  beforeEach(() => {
    mockReset(prisma);
  });

  const mockUser = { id: 'user-cuid-123' };
  const iam = new IamManager({ prisma, user: mockUser });

  describe('hasAccessTo', () => {
    test('should return true if the user has the required permission', async () => {
      const action = PermissionAction.CREATE;
      const resource = PermissionResource.POST;
      prisma.user.findUnique.mockResolvedValue({
        id: mockUser.id,
        createdAt: new Date(0),
        updatedAt: new Date(0),
        name: null,
        email: '',
        emailVerified: null,
        image: null,
      });

      const hasAccess = await iam.hasAccessTo(action, resource);

      expect(hasAccess).toBe(true);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          id: mockUser.id,
          userRoles: {
            some: {
              role: {
                rolePermissions: {
                  some: {
                    permission: {
                      OR: [
                        { action, resource },
                        { action, isWildcard: true },
                      ],
                    },
                  },
                },
              },
            },
          },
        },
        select: { id: true },
      });
    });

    test('should return false if the user does not have the required permission', async () => {
      const action = PermissionAction.READ;
      const resource = PermissionResource.POST;
      prisma.user.findUnique.mockResolvedValue(null);

      const hasAccess = await iam.hasAccessTo(action, resource);

      expect(hasAccess).toBe(false);
    });
  });

  test('createRole', async () => {
    const mockRole = {
      id: 'role-cuid-456',
      name: RoleName.OWNER,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    prisma.role.create.mockResolvedValue(mockRole);
    prisma.userRole.create.mockResolvedValue({
      userId: mockUser.id,
      roleId: mockRole.id,
      assignedAt: new Date(),
    });

    const role = await iam.createRole({ role: RoleName.OWNER });

    expect(role).toEqual(mockRole);
    expect(prisma.role.create).toHaveBeenCalledWith({
      data: { name: RoleName.OWNER },
    });
    expect(prisma.userRole.create).toHaveBeenCalledWith({
      data: { roleId: mockRole.id, userId: mockUser.id },
    });
  });

  test('assignRole', async () => {
    const roleToAssign = { id: 'role-cuid-789' };
    await iam.assignRole(roleToAssign);

    expect(prisma.userRole.create).toHaveBeenCalledWith({
      data: {
        roleId: roleToAssign.id,
        userId: mockUser.id,
      },
    });
  });

  test('getRole', async () => {
    const mockRole = {
      id: 'role-cuid-456',
      name: RoleName.OWNER,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    prisma.role.findUniqueOrThrow.mockResolvedValue(mockRole);

    const role = await iam.getRole({ id: mockRole.id });

    expect(role).toEqual(mockRole);
    expect(prisma.role.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { id: mockRole.id },
    });
  });

  test('getRoles', async () => {
    const mockRoles = [
      {
        id: 'role-1',
        name: RoleName.OWNER,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    prisma.role.findMany.mockResolvedValue(mockRoles);

    const roles = await iam.getRoles();

    expect(roles).toEqual(mockRoles);
    expect(prisma.role.findMany).toHaveBeenCalledWith({
      where: {
        userRoles: {
          every: {
            userId: mockUser.id,
          },
        },
      },
    });
  });

  test('removeRole', async () => {
    const mockRole = {
      id: 'role-to-delete',
      name: RoleName.OWNER,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    prisma.role.delete.mockResolvedValue(mockRole);

    const removedRole = await iam.removeRole({ id: mockRole.id });

    expect(removedRole).toEqual(mockRole);
    expect(prisma.role.delete).toHaveBeenCalledWith({
      where: { id: mockRole.id },
    });
  });

  test('addPermission', async () => {
    const mockRole = { id: 'role-cuid-456' };
    const permissionData = {
      action: PermissionAction.CREATE,
      resource: PermissionResource.POST,
      isWildcard: false,
    };
    const mockPermission = {
      id: 'perm-cuid-111',
      ...permissionData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prisma.permission.create.mockResolvedValue(mockPermission);

    const permission = await iam.addPermission(mockRole, permissionData);

    expect(permission).toEqual(mockPermission);
    expect(prisma.permission.create).toHaveBeenCalledWith({
      data: permissionData,
    });
    expect(prisma.rolePermission.create).toHaveBeenCalledWith({
      data: {
        roleId: mockRole.id,
        permissionId: mockPermission.id,
      },
    });
  });

  test('removePermission', async () => {
    const mockPermission = {
      id: 'perm-to-delete',
      action: PermissionAction.DELETE,
      resource: PermissionResource.POST,
      isWildcard: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    prisma.permission.delete.mockResolvedValue(mockPermission);

    const removedPermission = await iam.removePermission({
      id: mockPermission.id,
    });

    expect(removedPermission).toEqual(mockPermission);
    expect(prisma.permission.delete).toHaveBeenCalledWith({
      where: { id: mockPermission.id },
    });
  });
});
