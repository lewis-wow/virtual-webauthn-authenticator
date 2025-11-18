import { Exception } from '../Exception';

export const PAYMENT_REQUIRED = 'PAYMENT_REQUIRED';

export class PaymentRequired extends Exception {
  status = 402;
  code = PAYMENT_REQUIRED;

  constructor(message = 'Payment Required.') {
    super({
      message,
    });
  }
}
