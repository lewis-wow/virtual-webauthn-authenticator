import { JWKPublicKeyToCOSEPublicKey } from '../../src/JWKPublicKeyToCOSEPublicKey';
import { JsonWebPublicKey } from './JsonWebPublicKey';

export const COSEPublicKey = JWKPublicKeyToCOSEPublicKey(JsonWebPublicKey);
