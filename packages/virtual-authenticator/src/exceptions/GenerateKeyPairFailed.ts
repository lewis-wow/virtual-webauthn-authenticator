import { Exception } from '@repo/exception';

export const GENERATE_KEY_PAIR_FAILED = 'GENERATE_KEY_PAIR_FAILED';

export class GenerateKeyPairFailed extends Exception {
  static code = GENERATE_KEY_PAIR_FAILED;
  static message = `Generate key pair failed.`;
  static status = 500;
}
