import type { GenerateKeyPairFunc } from './GenerateKeyPairFunc';
import type { SignFunc } from './SignFunc';

export interface IKeyProvider {
  generateKeyPair: GenerateKeyPairFunc;
  sign: SignFunc;
}
