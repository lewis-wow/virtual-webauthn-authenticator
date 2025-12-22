import { Exception } from '@repo/exception';

export const NOT_ALLOWED_ERROR = 'NOT_ALLOWED_ERROR';

/**
 * NotAllowedError exception as defined in WebAuthn Level 3.
 * Thrown when the user does not consent to the requested operation.
 *
 * @see https://www.w3.org/TR/webauthn-3/#sctn-op-make-cred (Step 3.1)
 */
export class NotAllowedError extends Exception {
  static status = 403;
  static code = NOT_ALLOWED_ERROR;

  static message = `The user did not consent to the operation.`;
}
