import { Exception } from '@repo/exception';
import { HttpStatusCode } from '@repo/http';

export class InvalidUserVerificationPin extends Exception {
  static readonly code = 'InvalidUserVerificationPin';
  static readonly status = HttpStatusCode.FORBIDDEN_403;
  static readonly message = 'Invalid User Verification PIN.';
}
