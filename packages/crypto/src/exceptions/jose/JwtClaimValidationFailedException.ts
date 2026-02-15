import { JoseException } from '../JoseException';

export class JwtClaimValidationFailedException extends JoseException {
  static readonly code = 'JwtClaimValidationFailedException';
}
