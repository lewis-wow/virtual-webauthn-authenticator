import { JoseException } from '../JoseException';

export class JweDecryptionFailedException extends JoseException {
  static readonly code = 'JweDecryptionFailedException';
}
