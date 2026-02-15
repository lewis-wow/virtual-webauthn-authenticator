import { JoseException } from '../JoseException';

export class JwksInvalidException extends JoseException {
  static readonly code = 'JwksInvalidException';
}
