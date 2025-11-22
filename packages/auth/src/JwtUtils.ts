import { Schema } from 'effect';

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
    return Schema.is(PersonalJwtPayloadSchema)(jwtPayload);
  }

  static isApiKeyJwtPayload(
    jwtPayload: JwtPayload,
  ): jwtPayload is ApiKeyJwtPayload {
    return Schema.is(ApiKeyJwtPayloadSchema)(jwtPayload);
  }
}
