import { Exception } from '@repo/exception';

export const FAILED_TO_PARSE_COSE_PUBLIC_KEY =
  'FAILED_TO_PARSE_COSE_PUBLIC_KEY';

export class FailedToParseCosePublicKey extends Exception {
  code = FAILED_TO_PARSE_COSE_PUBLIC_KEY;
  message = 'Failed to parse COSE public key';
}
