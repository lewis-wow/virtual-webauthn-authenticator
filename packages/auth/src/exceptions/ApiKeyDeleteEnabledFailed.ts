import { Exception } from '@repo/exception';

export const API_KEY_DELETE_ENABLED_FAILED = 'API_KEY_DELETE_ENABLED_FAILED';

export class ApiKeyDeleteEnabledFailed extends Exception {
  static status = 405;
  static code = API_KEY_DELETE_ENABLED_FAILED;
  static message = 'Api key delete enabled failed.';
}
