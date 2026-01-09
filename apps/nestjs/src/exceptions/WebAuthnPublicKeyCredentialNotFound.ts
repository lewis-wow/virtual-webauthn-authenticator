import { Exception } from '@repo/exception';
import { HttpStatusCode } from '@repo/http';

export class WebAuthnPublicKeyCredentialNotFound extends Exception {
  static status = HttpStatusCode.NOT_FOUND;
  static readonly name = 'WebAuthnPublicKeyCredentialNotFound';
  static message = 'WebAuthn Public Key Credential Not Found.';
}
