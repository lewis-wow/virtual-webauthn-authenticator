import { Exception } from '@repo/exception';

export const SIGNATURE_FAILED = 'SIGNATURE_FAILED';

export class SignatureFailed extends Exception {
  static code = SIGNATURE_FAILED;
  static message = `Signature failed.`;
  static status = 500;
}
