import { KeyMapper } from '../../src';
import { JsonWebPublicKey } from './JsonWebPublicKey';

export const COSEPublicKey =
  KeyMapper.JWKPublicKeyToCOSEPublicKey(JsonWebPublicKey);
