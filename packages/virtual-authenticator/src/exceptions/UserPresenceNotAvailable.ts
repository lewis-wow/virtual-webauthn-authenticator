import { Exception } from '@repo/exception';

export class UserPresenceNotAvailable extends Exception {
  static status = 400;
  static message = 'User presence not available.';
}
