import {
  type PrismaClient,
  type User,
  type PermissionAction,
  type PermissionResource,
  type Permission,
  Prisma,
} from '@repo/prisma';

export type IamManagerOptions = {
  prisma: PrismaClient;
  user: Pick<User, 'id'>;
};

export class IamManager {
  private readonly prisma: PrismaClient;
  private readonly user: Pick<User, 'id'>;

  constructor(opts: IamManagerOptions) {
    this.prisma = opts.prisma;
    this.user = opts.user;
  }

  async hasAccessTo(
    action: PermissionAction,
    resource: PermissionResource,
  ): Promise<boolean> {
    const userWithPermission = await this.prisma.user.findUnique({
      where: {
        // 1. Find the user by their ID
        id: this.user.id,
        // 2. Check if they have AT LEAST ONE (`some`) UserRole relation...
        userRoles: {
          some: {
            // 3. ...where the associated Role...
            role: {
              // 4. ...has AT LEAST ONE (`some`) RolePermission relation...
              rolePermissions: {
                some: {
                  // 5. ...where the associated Permission matches our criteria.
                  permission: {
                    OR: [
                      // A specific permission matching the action and resource
                      {
                        action: action,
                        resource: resource,
                      },
                      // A wildcard permission for the action
                      {
                        action: action,
                        isWildcard: true,
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      },
      // We only need to know if the user exists, not their data.
      select: { id: true },
    });

    return !!userWithPermission;
  }

  async createPermission(data: {
    action: PermissionAction;
    resource: PermissionResource | null;
    isWildcard: boolean;
  }): Promise<Permission> {
    const { action, resource, isWildcard } = data;

    try {
      return await this.prisma.permission.create({
        data: {
          action,
          isWildcard: isWildcard,
          resource: resource ?? null,
        },
      });
    } catch (e) {
      // Check if the error is a unique constraint violation (code P2002)
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        // The permission already exists. Find it and return it.
        return await this.prisma.permission.findFirstOrThrow({
          where: {
            action: data.action,
            resource: data.resource ?? null,
          },
        });
      }
      // If it's a different error, re-throw it.
      throw e;
    }
  }

  async removePermission(criteria: {
    action: PermissionAction;
    resource: PermissionResource | null;
  }): Promise<Permission | null> {
    const { action, resource } = criteria;

    const permissionToDelete = await this.prisma.permission.findFirst({
      where: {
        action,
        resource,
      },
    });

    if (!permissionToDelete) {
      return null;
    }

    await this.prisma.permission.delete({
      where: { id: permissionToDelete.id },
    });

    return permissionToDelete;
  }
}
