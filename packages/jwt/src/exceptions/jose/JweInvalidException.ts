import { JoseException } from '../JoseException';

export class JweInvalidException extends JoseException {
  static readonly code = 'JweInvalidException';
}
