import { Exception } from '@repo/exception';
import { HttpStatusCode } from '@repo/http';

export class AlgorithmIdentifierNotFoundInCoseKey extends Exception {
  static status = HttpStatusCode.BAD_REQUEST;
  static readonly code = 'AlgorithmIdentifierNotFoundInCoseKey';
  static message = 'Algorithm identifier not found in COSE key';
}
