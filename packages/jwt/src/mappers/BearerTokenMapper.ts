import { fromBearerToken, toBearerToken, tryFromBearerToken } from '@repo/auth';

export class BearerTokenMapper {
  static toBearerToken(token: string): string {
    return toBearerToken(token);
  }

  static fromBearerToken(bearerToken: unknown): string {
    return fromBearerToken(bearerToken);
  }

  static tryFromBearerToken(bearerToken: unknown): string | null {
    return tryFromBearerToken(bearerToken);
  }
}
