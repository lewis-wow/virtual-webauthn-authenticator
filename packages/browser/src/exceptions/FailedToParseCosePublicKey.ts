import { Exception } from '@repo/exception';

export const FAILED_TO_PARSE_COSE_PUBLIC_KEY =
  'FAILED_TO_PARSE_COSE_PUBLIC_KEY';

export class FailedToParseCosePublicKey extends Exception {
  static code = FAILED_TO_PARSE_COSE_PUBLIC_KEY;
  static message = 'Failed to parse COSE public key';
}
