import { KeyMapper } from '../../src/KeyMapper';
import { JsonWebPublicKey } from './JsonWebPublicKey';

export const COSEPublicKey =
  KeyMapper.JWKPublicKeyToCOSEPublicKey(JsonWebPublicKey);
