import { Exception } from '@repo/exception';

export const API_KEY_REVOKE_FAILED = 'API_KEY_REVOKE_FAILED';

export class ApiKeyRevokeFailed extends Exception {
  status = 400;
  code = API_KEY_REVOKE_FAILED;
  message = 'Api key revoke failed.';
}
