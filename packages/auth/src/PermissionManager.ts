import {
  type Permission,
  type PrismaClient,
  PermissionSubject,
} from '@repo/prisma';

export type PermissionManagerOptions = {
  prisma: PrismaClient;
};

// Define who is requesting/receiving the permission
export type PermissionActor = {
  permissionSubject: PermissionSubject;
  subjectId: string;
};

// Define the structure of the permission request
export type PermissionRequest = {
  action: string; // e.g. "READ", "WRITE"
  resourceType: string; // e.g. "PROJECT", "INVOICE"
  resourceId: string | null; // Optional: if null, implies "All resources of this type"
};

export class PermissionManager {
  private readonly prisma: PrismaClient;

  constructor(opts: PermissionManagerOptions) {
    this.prisma = opts.prisma;
  }

  /**
   * Checks if an actor (User or API Key) has the specific permission.
   * Automatically checks for Wildcards (null resourceId).
   */
  async hasPermission(opts: {
    actor: PermissionActor;
    request: PermissionRequest;
  }): Promise<boolean> {
    const { actor, request } = opts;
    const { action, resourceType, resourceId } = request;

    // Construct the "Where" clause for the Actor
    const actorFilter =
      actor.permissionSubject === PermissionSubject.USER
        ? { userId: actor.subjectId }
        : { apiKeyId: actor.subjectId };

    // Logic:
    // 1. Match Actor
    // 2. Match Action
    // 3. Match Resource Type
    // 4. Match Resource ID (Exact ID match OR the user has a wildcard `null` entry)
    const matchConditions: any[] = [
      { resourceId: resourceId ?? null }, // Check for exact match
    ];

    // If checking a specific ID, also check if they have global access (null)
    if (resourceId) {
      matchConditions.push({ resourceId: null });
    }

    const count = await this.prisma.permission.count({
      where: {
        ...actorFilter,
        action,
        resourceType,
        OR: matchConditions,
      },
    });

    return count > 0;
  }

  /**
   * Grants a permission to a User or API Key.
   * Idempotent: uses upsert logic to avoid duplicates.
   */
  async grantPermission(opts: {
    actor: PermissionActor;
    request: PermissionRequest;
  }): Promise<Permission> {
    const { actor, request } = opts;
    const { action, resourceType, resourceId } = request;

    // Prepare data payload
    const data = {
      action,
      resourceType,
      resourceId: resourceId ?? null,
      permissionSubject: actor.permissionSubject,
      userId:
        actor.permissionSubject === PermissionSubject.USER
          ? actor.subjectId
          : null,
      apiKeyId:
        actor.permissionSubject === PermissionSubject.API_KEY
          ? actor.subjectId
          : null,
    };

    const existingPermission = await this.prisma.permission.findFirst({
      where: { ...data },
    });

    if (existingPermission) {
      return existingPermission;
    }

    const newPermission = await this.prisma.permission.create({
      data,
    });

    return newPermission;
  }

  /**
   * Revokes a specific permission.
   */
  async revokePermission(opts: {
    actor: PermissionActor;
    request: PermissionRequest;
  }): Promise<void> {
    const { actor, request } = opts;
    const { action, resourceType, resourceId } = request;

    const actorFilter =
      actor.permissionSubject === PermissionSubject.USER
        ? { userId: actor.subjectId }
        : { apiKeyId: actor.subjectId };

    // Deletes many in case of data inconsistencies, but usually deletes 1 or 0
    await this.prisma.permission.deleteMany({
      where: {
        ...actorFilter,
        action,
        resourceType,
        resourceId: resourceId ?? null,
      },
    });
  }

  /**
   * Lists all permissions for a specific actor
   */
  async listPermissions(opts: {
    actor: PermissionActor;
  }): Promise<Permission[]> {
    const { actor } = opts;

    const actorFilter =
      actor.permissionSubject === PermissionSubject.USER
        ? { userId: actor.subjectId }
        : { apiKeyId: actor.subjectId };

    const permissions = await this.prisma.permission.findMany({
      where: actorFilter,
    });

    return permissions;
  }
}
