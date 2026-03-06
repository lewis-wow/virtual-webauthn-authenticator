import type { VirtualAuthenticator } from '@repo/prisma';

import { VirtualAuthenticatorUserVerificationType } from '../../src/enums/VirtualAuthenticatorUserVerificationType';
import type {
  FindUniqueArgs,
  IVirtualAuthenticatorRepository,
} from '../../src/repositories/virtualAuthenticatorRepository/IVirtualAuthenticatorRepository';
import { VIRTUAL_AUTHENTICATOR_ID } from './consts';

/**
 * A mock implementation of IVirtualAuthenticatorRepository for testing.
 * Returns a default virtual authenticator with NONE user verification type.
 */
export class MockVirtualAuthenticatorRepository
  implements IVirtualAuthenticatorRepository
{
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async findUnique(_opts: FindUniqueArgs): Promise<VirtualAuthenticator> {
    return {
      id: VIRTUAL_AUTHENTICATOR_ID,
      userId: 'mock-user-id',
      userVerificationType: VirtualAuthenticatorUserVerificationType.NONE,
      pin: null,
      isActive: true,
      createdAt: new Date(0),
      updatedAt: new Date(0),
    };
  }
}
