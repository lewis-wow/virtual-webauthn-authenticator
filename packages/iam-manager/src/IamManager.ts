import {
  RoleName,
  type Permission,
  type PermissionAction,
  type PermissionResource,
  type PrismaClient,
  type Role,
  type User,
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

  async createRole(data: { role: RoleName }): Promise<Role> {
    const role = await this.prisma.role.create({ data: { name: data.role } });

    await this.prisma.userRole.create({
      data: { roleId: role.id, userId: this.user.id },
    });

    return role;
  }

  async assignRole(role: Pick<Role, 'id'>): Promise<void> {
    await this.prisma.userRole.create({
      data: {
        roleId: role.id,
        userId: this.user.id,
      },
    });
  }

  async getRole(role: Pick<Role, 'id'>): Promise<Role> {
    return await this.prisma.role.findUniqueOrThrow({
      where: {
        id: role.id,
      },
    });
  }

  async getRoles(): Promise<Role[]> {
    return await this.prisma.role.findMany({
      where: {
        userRoles: {
          every: {
            userId: this.user.id,
          },
        },
      },
    });
  }

  async removeRole(role: Pick<Role, 'id'>): Promise<Role | null> {
    const removedRole = await this.prisma.role.delete({
      where: { id: role.id },
    });

    return removedRole;
  }

  async addPermission(
    role: Pick<Role, 'id'>,
    data: {
      action: PermissionAction;
      resource: PermissionResource | null;
      isWildcard: boolean;
    },
  ): Promise<Permission> {
    const permission = await this.prisma.permission.create({
      data,
    });

    await this.prisma.rolePermission.create({
      data: {
        roleId: role.id,
        permissionId: permission.id,
      },
    });

    return permission;
  }

  async removePermission(
    permission: Pick<Permission, 'id'>,
  ): Promise<Permission> {
    return await this.prisma.permission.delete({
      where: {
        id: permission.id,
      },
    });
  }
}
