
import { JoseException } from '../JoseException';

export class JwtExpiredException extends JoseException {
  static readonly code = 'JwtExpiredException';
}
