import { Exception } from '@repo/exception';

export class CredentialOptionsEmpty extends Exception {
  static status = 400;
  static code = 'CREDENTIAL_OPTIONS_EMPTY';
  static message = 'Credential options empty.';
}
