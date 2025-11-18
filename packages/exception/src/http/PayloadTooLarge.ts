import { Exception } from '../Exception';

export const PAYLOAD_TOO_LARGE = 'PAYLOAD_TOO_LARGE';

export class PayloadTooLarge extends Exception {
  status = 413;
  code = PAYLOAD_TOO_LARGE;

  constructor(message = 'Payload Too Large.') {
    super({
      message,
    });
  }
}
