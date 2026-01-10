import { Exception } from '@repo/exception';
import { HttpStatusCode } from '@repo/http';

/**
 * NotAllowedError exception as defined in WebAuthn Level 3.
 * Thrown when the user does not consent to the requested operation.
 *
 * @see https://www.w3.org/TR/webauthn-3/#sctn-op-make-cred (Step 3.1)
 */
export class NotAllowedError extends Exception {
  static status = HttpStatusCode.FORBIDDEN_403;
  static readonly code = 'NotAllowedError';
  static message = 'The user did not consent to the operation.';
}
