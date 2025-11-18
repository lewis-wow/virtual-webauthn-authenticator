import { Exception } from '@repo/exception';

export const AUTHENTICATOR_DATA_TOO_SHORT = 'AUTHENTICATOR_DATA_TOO_SHORT';

export class AuthenticatorDataTooShort extends Exception {
  code = AUTHENTICATOR_DATA_TOO_SHORT;
  message = 'Authenticator data is too short';
}
