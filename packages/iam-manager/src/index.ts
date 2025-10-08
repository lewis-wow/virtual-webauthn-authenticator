import type { PrismaClient } from '@repo/prisma';

export type IamManagerOptions = {
  prisma: PrismaClient;
};

export class IamManager {
  private readonly prisma: PrismaClient;

  constructor(opts: IamManagerOptions) {
    this.prisma = opts.prisma;
  }

  async createUser(email: string, name?: string, password?: string) {
    return this.prisma.user.create({
      data: {
        email,
        name,
        password,
      },
    });
  }

  async assignRoleToUser(userId: string, roleName: string) {
    const role = await this.prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!role) {
      throw new Error(`Role ${roleName} not found`);
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        roles: {
          connect: { id: role.id },
        },
      },
    });
  }

  async hasPermission(userId: string, permissionName: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!user) {
      return false;
    }

    return user.roles.some((role) =>
      role.permissions.some((permission) => permission.name === permissionName)
    );
  }
}

async function main() {
  const prisma = new PrismaClient();
  const iamManager = new IamManager({ prisma });

  // Example usage:
  const user = await iamManager.createUser('test@example.com', 'Test User', 'password');
  console.log('Created user:', user);

  // You would create roles and permissions in your database separately
  // For example, create a role 'admin' with permission 'read:users'
  // Then you can assign the role to the user
  // await iamManager.assignRoleToUser(user.id, 'admin');
  // const canReadUsers = await iamManager.hasPermission(user.id, 'read:users');
  // console.log(`Can read users: ${canReadUsers}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
