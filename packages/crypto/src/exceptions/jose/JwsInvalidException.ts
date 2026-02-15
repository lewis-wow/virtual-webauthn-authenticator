import { JoseException } from '../JoseException';

export class JwsInvalidException extends JoseException {
  static readonly code = 'JwsInvalidException';
}
