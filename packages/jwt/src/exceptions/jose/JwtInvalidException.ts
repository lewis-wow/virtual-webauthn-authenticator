import { JoseException } from '../JoseException';

export class JwtInvalidException extends JoseException {
  static readonly code = 'JwtInvalidException';
}
