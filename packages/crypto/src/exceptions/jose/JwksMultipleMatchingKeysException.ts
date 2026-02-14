
import { JoseException } from '../JoseException';

export class JwksMultipleMatchingKeysException extends JoseException {
  static readonly code = 'JwksMultipleMatchingKeysException';
}
