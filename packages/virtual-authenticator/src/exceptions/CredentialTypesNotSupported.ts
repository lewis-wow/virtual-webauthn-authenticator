import { Exception } from '@repo/exception';

export const CREDENTIAL_TYPES_NOT_SUPPORTED = 'CREDENTIAL_TYPES_NOT_SUPPORTED';

export class CredentialTypesNotSupported extends Exception {
  static status = 400;
  static code = CREDENTIAL_TYPES_NOT_SUPPORTED;
  static message = 'Credential types not supported.';
}
