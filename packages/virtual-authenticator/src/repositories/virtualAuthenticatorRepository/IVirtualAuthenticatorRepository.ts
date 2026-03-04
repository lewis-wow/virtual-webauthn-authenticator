import type { VirtualAuthenticator } from '@repo/prisma';

export type FindUniqueArgs = {
  virtualAuthenticatorId: string;
};

export interface IVirtualAuthenticatorRepository {
  findUnique(opts: FindUniqueArgs): Promise<VirtualAuthenticator>;
}
