import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class PayloadTooLarge extends Exception {
  static status = HttpStatusCode.PAYLOAD_TOO_LARGE;
  static readonly code = 'PayloadTooLarge';
  static message = 'Payload Too Large.';
}
