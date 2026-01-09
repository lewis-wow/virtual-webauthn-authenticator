import { Exception } from '@repo/exception';
import { HttpStatusCode } from '@repo/http';

/**
 * InvalidStateError exception as defined in WebAuthn Level 3.
 * Thrown when the authenticator is in an invalid state for the requested operation.
 *
 * @see https://www.w3.org/TR/webauthn-3/#sctn-op-make-cred (Step 3.1)
 */
export class InvalidStateError extends Exception {
  static status = HttpStatusCode.BAD_REQUEST;
  static readonly name = 'InvalidStateError';
  static message =
    'The authenticator is in an invalid state for this operation.';
}
