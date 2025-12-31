import { Exception } from '@repo/exception';

export class WebAuthnPublicKeyCredentialNotFound extends Exception {
  static status = 404;
  static code = 'WEBAUTHN_PUBLIC_KEY_CREDENTIAL_NOT_FOUND';
  static message = 'WebAuthn Public Key Credential Not Found.';
}
