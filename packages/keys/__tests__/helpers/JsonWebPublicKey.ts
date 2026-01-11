import { JWKKeyCurveName } from '../../src/enums/JWKKeyCurveName';
import { JWKKeyType } from '../../src/enums/JWKKeyType';

export const JsonWebPublicKey = {
  kty: JWKKeyType.EC,
  crv: JWKKeyCurveName['P-256'],
  x: '46h_Gf2I-GAe3AnwT3a4u2bYgPKFF5eQ8eZ5LLu-DPg',
  y: 'qNR4i6nXA6JNFkY8-Tf52KT82i3pT68spV2unkjceXY',
};
