import { test, describe, expect, beforeEach } from 'vitest';
import {
  PrismaClient,
  PermissionAction,
  PermissionResource,
} from '@repo/prisma';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { IamManager } from '../../src/IamManager.js';

const prisma = mockDeep<PrismaClient>();

describe('IamManager', () => {
  beforeEach(() => {
    mockReset(prisma);
  });

  const mockUser = { id: 'user-cuid-123' };

  test('should return true if the user has the required permission', async () => {
    const iam = new IamManager({ prisma, user: mockUser });
    const action = PermissionAction.CREATE;
    const resource = PermissionResource.POST;
    const createdAt = new Date();

    prisma.user.findFirst.mockResolvedValue({
      id: mockUser.id,
      name: 'Test User',
      email: 'test@example.com',
      createdAt,
      updatedAt: createdAt,
      image: null,
      emailVerified: null,
    });

    const hasAccess = await iam.hasAccessTo(action, resource);

    // Assert: Check the result and that the correct query was made
    expect(hasAccess).toBe(true);
    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: {
        id: mockUser.id,
        roles: { some: { permissions: { some: { name: permission } } } },
      },
    });
  });

  test('should return false if the user does not have the required permission', async () => {
    // Arrange
    const iam = new IamManager({ prisma, user: mockUser });
    const permission: PermissionName = 'DELETE';

    // Mock the database call to return null
    prisma.user.findFirst.mockResolvedValue(null);

    // Act
    const hasAccess = await iam.hasAccessTo(permission);

    // Assert
    expect(hasAccess).toBe(false);
    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: {
        id: mockUser.id,
        roles: { some: { permissions: { some: { name: permission } } } },
      },
    });
  });
});
