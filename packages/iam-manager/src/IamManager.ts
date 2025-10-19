import {
  type PrismaClient,
  type User,
  PermissionAction,
  ResourceType,
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

  /**
   * Checks if the user has permission to perform an action on a given resource.
   */
  async hasAccess(opts: {
    action: PermissionAction;
    resourceType: ResourceType;
    resourceId?: string;
  }): Promise<boolean> {
    const { action, resourceType, resourceId } = opts;

    const permission = await this.prisma.permission.findFirst({
      where: {
        userId: this.user.id,
        action: action,
        resourceType: resourceType,
        OR: [{ resourceId: resourceId }, { resourceId: null }],
      },
    });

    return !!permission;
  }

  /**
   * Grants a user a specific permission for a resource type or a single resource instance.
   * This operation is idempotent; it does nothing if the permission already exists.
   */
  async grant(opts: {
    action: PermissionAction;
    resourceType: ResourceType;
    resourceId: string;
  }): Promise<void> {
    const { action, resourceType, resourceId } = opts;

    const data = {
      userId: this.user.id,
      action,
      resourceType,
      resourceId,
    };

    // Upsert ensures the permission is created without causing an error if it already exists.
    await this.prisma.permission.upsert({
      where: {
        // This references the @@unique constraint in your Prisma schema
        userId_action_resourceType_resourceId: {
          ...data,
        },
      },
      create: data,
      update: {}, // Do nothing if it already exists
    });
  }

  /**
   * Revokes a specific permission from the user.
   * This operation is idempotent; it does nothing if the permission doesn't exist.
   */
  async revoke(opts: {
    action: PermissionAction;
    resourceType: ResourceType;
    resourceId: string;
  }): Promise<void> {
    // deleteMany is used because it doesn't throw an error if the record is not found.
    await this.prisma.permission.deleteMany({
      where: {
        userId: this.user.id,
        action: opts.action,
        resourceType: opts.resourceType,
        resourceId: opts.resourceId,
      },
    });
  }

  /**
   * Grants a user full ownership permissions (CREATE, READ, UPDATE, DELETE)
   * for a specific resource instance.
   */
  async grantOwnership(opts: {
    resourceType: ResourceType;
    resourceId: string;
  }) {
    const { resourceType, resourceId } = opts;

    await this.prisma.permission.createMany({
      data: Object.values(PermissionAction).map((action) => ({
        action,
        userId: this.user.id,
        resourceType,
        resourceId,
      })),
      skipDuplicates: true,
    });
  }
}
