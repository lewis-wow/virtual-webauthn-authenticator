import { Exception } from '../Exception';

export const SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE';

export class ServiceUnavailable extends Exception {
  status = 503;
  code = SERVICE_UNAVAILABLE;

  constructor(message = 'Service Unavailable.') {
    super({
      message,
    });
  }
}
