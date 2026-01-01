import { Exception } from '@repo/exception';

export const UNEXPECTED_WEB_AUTHN_CREDENTIAL_KEY_META_TYPE =
  'UNEXPECTED_WEB_AUTHN_CREDENTIAL_KEY_META_TYPE';

export class UnexpectedWebAuthnPublicKeyCredentialKeyMetaType extends Exception {
  status = 500;
  code = UNEXPECTED_WEB_AUTHN_CREDENTIAL_KEY_META_TYPE;
  message = `Unexpected WebAuthn credential key meta type.`;
}
