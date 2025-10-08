import { bufferTransformer, Transformable } from '@repo/transformers';
import type { IAuthenticatorAssertionResponse } from '../types.js';
import { Expose, Transform } from 'class-transformer';

export class AuthenticatorAssertionResponseDto
  extends Transformable
  implements IAuthenticatorAssertionResponse
{
  @Expose()
  type = AuthenticatorAssertionResponseDto.name;

  @Transform(bufferTransformer('base64url'))
  authenticatorData!: Buffer;

  @Transform(bufferTransformer('base64url'))
  signature!: Buffer;

  @Transform(bufferTransformer('base64url'))
  userHandle!: Buffer | null;

  @Transform(bufferTransformer('base64url'))
  clientDataJSON!: Buffer;
}
