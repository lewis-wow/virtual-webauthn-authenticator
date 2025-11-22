import { Exception } from '../Exception';

export const SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE';

export class ServiceUnavailable extends Exception {
  static status = 503;
  static code = SERVICE_UNAVAILABLE;

  constructor(message = 'Service Unavailable.') {
    super({
      message,
    });
  }
}
