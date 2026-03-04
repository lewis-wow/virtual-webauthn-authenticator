import type {
  IVirtualAuthenticatorRepository,
  ValidatePinArgs,
} from '../../src/repositories/virtualAuthenticatorRepository/IVirtualAuthenticatorRepository';

/**
 * A mock implementation of IVirtualAuthenticatorRepository for testing.
 * Always validates the pin successfully.
 */
export class MockVirtualAuthenticatorRepository
  implements IVirtualAuthenticatorRepository
{
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async validatePin(_opts: ValidatePinArgs): Promise<boolean> {
    return true;
  }
}
