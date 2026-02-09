import { Exception } from '@repo/exception';

export class UserVerificationRequired extends Exception {
  static readonly code = 'USER_VERIFICATION_REQUIRED';
  static readonly status = 400;

  constructor(message = 'User Verification (UV) is required to proceed.') {
    super({ message });
  }
}
