import {
  ApiKeyJwtPayloadSchema,
  PersonalJwtPayloadSchema,
  type ApiKeyJwtPayload,
  type JwtPayload,
  type PersonalJwtPayload,
} from '@repo/validation';

export class JwtUtils {
  isPersonalJwtPayload(
    jwtPayload: JwtPayload,
  ): jwtPayload is PersonalJwtPayload {
    const result = PersonalJwtPayloadSchema.safeParse(jwtPayload);

    return result.success;
  }

  isApiKeyJwtPayload(jwtPayload: JwtPayload): jwtPayload is ApiKeyJwtPayload {
    const result = ApiKeyJwtPayloadSchema.safeParse(jwtPayload);

    return result.success;
  }
}
