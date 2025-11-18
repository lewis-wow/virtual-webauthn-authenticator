import { Exception } from '@repo/exception';

export const ALGORITHM_IDENTIFIER_NOT_FOUND_IN_COSE_KEY =
  'ALGORITHM_IDENTIFIER_NOT_FOUND_IN_COSE_KEY';

export class AlgorithmIdentifierNotFoundInCoseKey extends Exception {
  code = ALGORITHM_IDENTIFIER_NOT_FOUND_IN_COSE_KEY;
  message = 'Algorithm identifier not found in COSE key';
}
