import { bufferTransformer, Transformable } from '@repo/transformers';
import type { IAuthenticatorAttestationResponse } from '@repo/types';
import { Expose, Transform } from 'class-transformer';

export class AuthenticatorAttestationResponseDto
  extends Transformable
  implements IAuthenticatorAttestationResponse
{
  @Expose()
  type = AuthenticatorAttestationResponseDto.name;

  @Transform(bufferTransformer('base64url'))
  attestationObject!: Buffer;

  @Transform(bufferTransformer('base64url'))
  clientDataJSON!: Buffer;
}
