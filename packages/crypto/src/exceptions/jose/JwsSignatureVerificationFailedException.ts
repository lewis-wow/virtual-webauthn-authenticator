
import { JoseException } from '../JoseException';

export class JwsSignatureVerificationFailedException extends JoseException {
  static readonly code = 'JwsSignatureVerificationFailedException';
}
