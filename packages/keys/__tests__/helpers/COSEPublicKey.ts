import { COSEKeyMapper } from '../../src/mappers/COSEKeyMapper';
import { JsonWebPublicKey } from './JsonWebPublicKey';

export const COSEPublicKey = COSEKeyMapper.jwkToCOSEKey(JsonWebPublicKey);
