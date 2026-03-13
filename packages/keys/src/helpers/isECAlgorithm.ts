import { JWKKeyAlgorithm } from '../enums/JWKKeyAlgorithm';

export const isECAlgorithm = (algorithm: JWKKeyAlgorithm) => {
  return (
    algorithm === JWKKeyAlgorithm.ES256 ||
    algorithm === JWKKeyAlgorithm.ES384 ||
    algorithm === JWKKeyAlgorithm.ES512
  );
};
