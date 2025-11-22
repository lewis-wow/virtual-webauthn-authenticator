import { Exception } from '@repo/exception';

export const ALGORITHM_IDENTIFIER_NOT_FOUND_IN_COSE_KEY =
  'ALGORITHM_IDENTIFIER_NOT_FOUND_IN_COSE_KEY';

export class AlgorithmIdentifierNotFoundInCoseKey extends Exception {
  static code = ALGORITHM_IDENTIFIER_NOT_FOUND_IN_COSE_KEY;
  static message = 'Algorithm identifier not found in COSE key';
}
