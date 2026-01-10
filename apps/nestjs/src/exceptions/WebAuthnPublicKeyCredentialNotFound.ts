import { Exception } from '@repo/exception';
import { HttpStatusCode } from '@repo/http';

export class WebAuthnPublicKeyCredentialNotFound extends Exception {
  static status = HttpStatusCode.NOT_FOUND_404;
  static readonly code = 'WebAuthnPublicKeyCredentialNotFound';
  static message = 'WebAuthn Public Key Credential Not Found.';
}
