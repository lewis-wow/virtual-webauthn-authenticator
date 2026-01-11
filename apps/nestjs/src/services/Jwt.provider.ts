import { Provider } from '@nestjs/common';
import { Jwks, Jwt } from '@repo/crypto';

export const JwtProvider: Provider = {
  provide: Jwt,
  useFactory: (jwks: Jwks) => {
    const jwt = new Jwt({
      jwks,
    });

    return jwt;
  },
  inject: [Jwks],
};
