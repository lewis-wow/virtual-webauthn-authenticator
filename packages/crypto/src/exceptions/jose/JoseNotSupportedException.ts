import { JoseException } from '../JoseException';

export class JoseNotSupportedException extends JoseException {
  static readonly code = 'JoseNotSupportedException';
}
