import { Exception } from '@repo/exception';

export const INVALID_STATE_ERROR = 'INVALID_STATE_ERROR';

/**
 * InvalidStateError exception as defined in WebAuthn Level 3.
 * Thrown when the authenticator is in an invalid state for the requested operation.
 *
 * @see https://www.w3.org/TR/webauthn-3/#sctn-op-make-cred (Step 3.1)
 */
export class InvalidStateError extends Exception {
  static status = 400;
  static code = INVALID_STATE_ERROR;

  static message = `The authenticator is in an invalid state for this operation.`;
}
