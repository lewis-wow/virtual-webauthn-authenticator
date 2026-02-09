import { Extension } from './Extension';

/**
 * HMAC-Secret Extension (hmac-secret).
 *
 * This CTAP2 extension enables authenticators to generate symmetric secrets
 * tied to specific credentials. During registration, it indicates that the
 * credential supports HMAC-secret operations.
 *
 * **Registration**: When enabled (`hmac-secret: true`), returns `true` in
 * client extension results to indicate the credential supports hmac-secret.
 *
 * **Authentication**: Not yet fully implemented. Would require storing
 * CredRandom with credentials and computing HMAC-SHA-256 with client salts.
 *
 * @see https://fidoalliance.org/specs/fido-v2.1-ps-20210615/fido-client-to-authenticator-protocol-v2.1-ps-errata-20220621.html#sctn-hmac-secret-extension
 */
export class HmacSecretExtension extends Extension<
  {
    clientInput: boolean | { salt1: Uint8Array; salt2?: Uint8Array };
    context: unknown;
  },
  boolean | null,
  unknown,
  boolean
> {
  readonly identifier = 'hmac-secret';
  readonly requiresAuthenticatorProcessing = true;

  /**
   * Process input for registration or authentication.
   *
   * For registration (clientInput = true): Returns true indicating the
   * authenticator should enable hmac-secret for this credential.
   *
   * For authentication (clientInput = {salt1, salt2?}): Validates salt inputs.
   *
   * @returns Boolean for authenticator processing, or null for no processing
   */
  processInput(opts: {
    clientInput: boolean | { salt1: Uint8Array; salt2?: Uint8Array };
    context: unknown;
  }): boolean | null {
    const { clientInput } = opts;

    // Registration: clientInput is boolean true
    if (clientInput === true) {
      return true;
    }

    // Authentication: clientInput contains salts
    if (
      typeof clientInput === 'object' &&
      clientInput !== null &&
      'salt1' in clientInput
    ) {
      // Validate salt1 is present (salt2 is optional)
      if (!(clientInput.salt1 instanceof Uint8Array)) {
        return null;
      }

      return true;
    }

    return null;
  }

  /**
   * Process output for registration.
   *
   * For registration: Returns `true` indicating hmac-secret is enabled
   * for this credential.
   *
   * @returns true for registration, indicating hmac-secret support
   */
  processOutput(): boolean {
    // For registration, just return true to indicate hmac-secret is enabled
    // The actual HMAC computation during authentication is not yet implemented
    // as it requires CredRandom storage in the credential repository
    return true;
  }
}
