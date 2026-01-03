import { COSEKeyMapper } from '../../src/mappers/KeyMapper';
import { JsonWebPublicKey } from './JsonWebPublicKey';

export const COSEPublicKey = COSEKeyMapper.jwkToCOSEKey(JsonWebPublicKey);
