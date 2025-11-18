import { Exception } from '@repo/exception';

export const API_KEY_DELETE_FAILED = 'API_KEY_DELETE_FAILED';

export class ApiKeyDeleteFailed extends Exception {
  status = 400;
  code = API_KEY_DELETE_FAILED;
  message = 'Api key delete failed.';
}
