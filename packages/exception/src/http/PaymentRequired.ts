import { HttpStatusCode } from '@repo/http';

import { Exception } from '../Exception';

export class PaymentRequired extends Exception {
  static status = HttpStatusCode.PAYMENT_REQUIRED;
  static readonly name = 'PaymentRequired';
  static message = 'Payment Required.';
}
