import { Exception } from '@repo/exception';
import { HttpStatusCode } from '@repo/http';

export class CredentialExcluded extends Exception {
  // 409 Conflict is the standard HTTP status for "Resource already exists"
  static status = HttpStatusCode.CONFLICT_409;
  static readonly code = 'CredentialExcluded';
  static message = 'Authenticator already contains a credential.';
}
