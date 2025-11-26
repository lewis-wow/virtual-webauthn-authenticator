import { Exception } from '@repo/exception';

export const API_KEY_REVOKE_FAILED = 'API_KEY_REVOKE_FAILED';

export class ApiKeyRevokeFailed extends Exception {
  static status = 400;
  static code = API_KEY_REVOKE_FAILED;
  static message = 'Api key revoke failed.';
}
