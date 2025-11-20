import { Exception } from '../Exception';

export const PAYMENT_REQUIRED = 'PAYMENT_REQUIRED';

export class PaymentRequired extends Exception {
  static status = 402;
  static code = PAYMENT_REQUIRED;

  constructor(message = 'Payment Required.') {
    super({
      message,
    });
  }
}
