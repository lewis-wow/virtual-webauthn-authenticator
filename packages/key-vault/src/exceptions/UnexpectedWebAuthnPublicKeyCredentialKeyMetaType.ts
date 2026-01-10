import { Exception } from '@repo/exception';
import { HttpStatusCode } from '@repo/http';

export class UnexpectedWebAuthnPublicKeyCredentialKeyMetaType extends Exception {
  static status = HttpStatusCode.INTERNAL_SERVER_ERROR;
  static readonly code = 'UnexpectedWebAuthnPublicKeyCredentialKeyMetaType';
  static message = 'Unexpected WebAuthn credential key meta type.';
}
