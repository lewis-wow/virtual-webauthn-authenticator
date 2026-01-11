import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class PaymentRequired extends Exception {
  static status = HttpStatusCode.PAYMENT_REQUIRED_402;
  static readonly code = 'PaymentRequired';
  static message = 'Payment Required.';
}
