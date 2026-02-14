
import { JoseException } from '../JoseException';

export class JwksNoMatchingKeyException extends JoseException {
  static readonly code = 'JwksNoMatchingKeyException';
}
