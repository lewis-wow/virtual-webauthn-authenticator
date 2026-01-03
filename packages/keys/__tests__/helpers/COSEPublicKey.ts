import { KeyMapper } from '../../src/mappers/KeyMapper';
import { JsonWebPublicKey } from './JsonWebPublicKey';

export const COSEPublicKey = KeyMapper.JWKToCOSE(JsonWebPublicKey);
