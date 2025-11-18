import { Exception } from '@repo/exception';

export const API_KEY_DELETE_ENABLED_FAILED = 'API_KEY_DELETE_ENABLED_FAILED';

export class ApiKeyDeleteEnabledFailed extends Exception {
  status = 405;
  code = API_KEY_DELETE_ENABLED_FAILED;
  message = 'Api key delete enabled failed.';
}
