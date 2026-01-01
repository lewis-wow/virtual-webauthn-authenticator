import { Exception } from '@repo/exception';

export const USER_VERIFICATION_NOT_AVAILABLE =
  'USER_VERIFICATION_NOT_AVAILABLE';

export class UserVerificationNotAvailable extends Exception {
  static status = 400;
  static code = USER_VERIFICATION_NOT_AVAILABLE;
  static message = 'User verification not available.';
}
