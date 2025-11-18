import {
  ApiKeyJwtPayloadSchema,
  type ApiKeyJwtPayload,
} from './validation/ApiKeyJwtPayloadSchema';
import type { JwtPayload } from './validation/JwtPayloadSchema';
import {
  PersonalJwtPayloadSchema,
  type PersonalJwtPayload,
} from './validation/PersonalJwtPayloadSchema';

export class JwtUtils {
  static isPersonalJwtPayload(
    jwtPayload: JwtPayload,
  ): jwtPayload is PersonalJwtPayload {
    const result = PersonalJwtPayloadSchema.safeParse(jwtPayload);

    return result.success;
  }

  static isApiKeyJwtPayload(
    jwtPayload: JwtPayload,
  ): jwtPayload is ApiKeyJwtPayload {
    const result = ApiKeyJwtPayloadSchema.safeParse(jwtPayload);

    return result.success;
  }
}
