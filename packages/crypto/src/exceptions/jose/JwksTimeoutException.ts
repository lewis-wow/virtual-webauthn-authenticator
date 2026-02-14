
import { JoseException } from '../JoseException';

export class JwksTimeoutException extends JoseException {
  static readonly code = 'JwksTimeoutException';
}
