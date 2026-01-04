import { KeyMapper } from '../../src/shared/mappers/KeyMapper';
import { JsonWebPublicKey } from './JsonWebPublicKey';

export const COSEPublicKey = KeyMapper.JWKToCOSE(JsonWebPublicKey);
