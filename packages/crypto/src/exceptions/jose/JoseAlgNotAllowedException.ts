import { JoseException } from '../JoseException';

export class JoseAlgNotAllowedException extends JoseException {
  static readonly code = 'JoseAlgNotAllowedException';
}
