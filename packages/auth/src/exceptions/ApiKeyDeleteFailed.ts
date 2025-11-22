import { Exception } from '@repo/exception';

export const API_KEY_DELETE_FAILED = 'API_KEY_DELETE_FAILED';

export class ApiKeyDeleteFailed extends Exception {
  static status = 400;
  static code = API_KEY_DELETE_FAILED;
  static message = 'Api key delete failed.';
}
